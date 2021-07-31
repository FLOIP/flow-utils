import { IBlock, IBlockExit, IContainer, IFlow, ILanguage, IResource, IResourceValue, SupportedContentType, SupportedMode } from '@floip/flow-runner'
import {RPFlow, RPNode, RPRouter_Switch, RPRouterSwitchCase, RPActionType, RPRouterSwitchTestType, RPAction, RPRouter, RPRouterType, RPMessagingType, RPUuid} from '..'
import { ok, err, Result } from 'neverthrow'
import { getRapidProStructureErrors } from '..'
import {v4 as uuidv4} from 'uuid';
import slugify from 'slugify';

export type FloipError = string

interface IPoint {
  x: number,
  y: number
}

export class RapidProToFlowInteropConverter {

  /// Source RapidPro JSON to convert
  protected rpFlowJson: string

  /// Source RapidPro flow to convert
  protected rpFlow = {} as RPFlow
  
  /// Our converted Flow Interop blocks
  protected blocks = [] as IBlock[]

  /// Languages
  protected languages = [] as ILanguage[]
  protected language_id = ""

  /// Resources
  protected resources = [] as IResource[]

  /// Mapping from RapidPro node UUID to Flow Interop block UUID
  protected rpUuidToFIUuid: Map<string, string> = new Map<string, string>()

  constructor(sourceRapidProJson: string) {
    this.rpFlowJson = sourceRapidProJson
  }

  convert(): Result<string, FloipError> {
    const container = JSON.parse(this.rpFlowJson)
    const errors = getRapidProStructureErrors(container)

    if(errors) {
      return err("Error parsing RapidPro flow: " + errors.join())
    }

    this.rpFlow = container as RPFlow

    //try {
      this.languagesFromRPFlow()
      this.prepareRPFlow()

      // Convert blocks:
      // console.log("Starting to convert nodes to blocks; nodes are: " + JSON.stringify(this.rpFlow.nodes))
      this.rpFlow.nodes.forEach(rpNode => {
        const newBlocks = this.convertRPNodeToFIBlocks(rpNode)
        // One RP Node with multiple actions will turn into multiple Flow Interop blocks
        // Remember the mapping from the RP Node uuid to the uuid of the first block in the Flow Interop set for this node
        this.rpUuidToFIUuid.set(rpNode.uuid, newBlocks[0].uuid)
        if(newBlocks !== null) {
          this.blocks.push(...newBlocks)
        }
      })
    // }
    // catch(error) {
    //   return err("Error converting blocks: " + error)
    // }

    this.convertRPUuidsToFIUuids()
    const firstBlockId = this.rpUuidToFIUuid.get(this.rpFlow.nodes[0].uuid)
    
    let fiFlow = {
      uuid: this.rpFlow.uuid,
      name: this.rpFlow.name,
      interaction_timeout: this.rpFlow.expire_after_minutes*60,
      supported_modes: this.supportedModesFromRPMessagingType(this.rpFlow.type),
      languages: this.languages,
      last_modified: (new Date()).toISOString(),
      first_block_id: firstBlockId,
      blocks: this.blocks,
      // vendor_metadata: {converted_from_rapid_pro: this.rpFlow},
    } as IFlow

    let fiContainer = {
      specification_version: "1.0.0-rc2",
      uuid: this.rpFlow.uuid, // TODO: Do not share with flow? Update when we work multiple flows into a container
      name: this.rpFlow.name,
      flows: [fiFlow],
      resources: this.resources
    } as IContainer

    return ok(JSON.stringify(fiContainer, null, 2))
  }

  /// Prepare the RapidPro flow with normalization needed before conversion
  protected prepareRPFlow() {
    this.prepareRPFlow_mergeDirectLinksIntoActions()
  }

  /// Prepare RapidPro flow by merging any nodes with single outputs into consecutive actions. This is important so that
  /// the conversion stage has message actions grouped with subsequent routers, so we convert into a single block rather
  /// than two blocks where one has no content.
  protected prepareRPFlow_mergeDirectLinksIntoActions(): void {
    // console.log("Starting merge, nodes are: " + JSON.stringify(this.rpFlow.nodes))
    // foreach nodes
    for(let i=0; i<this.rpFlow.nodes.length; i++) {
      const rpNode = this.rpFlow.nodes[i]
      const singleDestinationUuid = this.rpNodeSingleDestination(rpNode)
      
      // We also need to check that the destination only has a single input from this block! If there are other blocks that have the destination as their destination, we cannot do this collapse
      if(singleDestinationUuid && this.countRPExitsHavingDestination(singleDestinationUuid) == 1) {
        // console.log("Node " + rpNode.uuid + " has single destination: " + singleDestinationUuid)
        this.rpMoveActionsAndRemoveNode(this.rpFindNodeIndex(rpNode.uuid)!, this.rpFindNodeIndex(singleDestinationUuid)!)
        // We've made one merge. Now start over and try again, until there are no more changes to make
        return this.prepareRPFlow_mergeDirectLinksIntoActions()
      }
    }
  }

  /// Count the number of RapidPro exits that have destinationNodeUuid as their destination
  protected countRPExitsHavingDestination(destinationNodeUuid: string) {
    let count = 0
    for(let i=0; i<this.rpFlow.nodes.length; i++) {
      const rpNode = this.rpFlow.nodes[i]
      for(let j=0; j<rpNode.exits.length; j++) {
        if(rpNode.exits[j].destination_uuid == destinationNodeUuid) {
          count++
        }
      }
    }
    return count
  }

  /// Move the actions from sourceNode to destinationNode, and remove sourceNode from the flow. We use this to remove redundant nodes that could be actions within a single node.
  protected rpMoveActionsAndRemoveNode(sourceNodeIndex: number, destinationNodeIndex: number) {
    // console.log("moving actions from source node " + sourceNodeIndex + " to " + destinationNodeIndex)
    const sourceNode = this.rpFlow.nodes[sourceNodeIndex]
    const destinationNode = this.rpFlow.nodes[destinationNodeIndex]

    // Prepend actions from source node into destination node
    this.rpFlow.nodes[destinationNodeIndex].actions.unshift(...this.rpFlow.nodes[sourceNodeIndex].actions);
    // Remove the source node
    this.rpFlow.nodes.splice(sourceNodeIndex, 1)
    
    // If sourceNode was the starting node, we need to make sure that destinationNode is promoted to be the starting node.
    if(sourceNodeIndex == 0) {
      const newDestinationNodeIndex = this.rpFindNodeIndex(destinationNode.uuid)
      // Remove destination node...
      this.rpFlow.nodes.splice(newDestinationNodeIndex, 1)
      // And put it back in at the front of the list of nodes. Now it is the starting node.
      this.rpFlow.nodes.unshift(destinationNode)
    }

    // On all nodes: where a destination_uuid was sourceNode.uuid, replace it with destinationNode.uuid, since we've deleted sourceNode and moved its contents to destinationNode
    this.rpReplaceDestinations(sourceNode.uuid, destinationNode.uuid)
  }

  /// Find an RPNode by its UUID
  protected rpFindNode(uuid: RPUuid) {
    return this.rpFlow.nodes.find(n => n.uuid == uuid)
  }

  /// Find the index of an RPNode by its UUID
  protected rpFindNodeIndex(uuid: RPUuid) {
    return this.rpFlow.nodes.findIndex(n => n.uuid == uuid)
  }

  /// Go through all exits of all RP Nodes, and if sourceNodeUuid is found, replace it with replacementNodeUuid
  protected rpReplaceDestinations(sourceNodeUuid: RPUuid, replacementNodeUuid: RPUuid) {
    for(let i=0; i<this.rpFlow.nodes.length; i++) {
      for(let j=0; j<this.rpFlow.nodes[i].exits.length; j++) {
        if(this.rpFlow.nodes[i].exits[j].destination_uuid == sourceNodeUuid) {
          this.rpFlow.nodes[i].exits[j].destination_uuid = replacementNodeUuid
        }
      }
    }
  }

  /// Returns the UUID of the starting node in the RapidPro flow
  protected rpStartingNodeUuid() : RPUuid|null|undefined {
    if(this.rpFlow.nodes.length == 0) {
      return null
    }
    return this.rpFlow.nodes[0].uuid
  }

  /// Returns the destination UUID of a RP node, if a node has a single exit, and can be collapsed into a subsequent node
  protected rpNodeSingleDestination(rpNode: RPNode) : RPUuid|null|undefined {
    const router = rpNode.router
    // If no router: there should be a single default exit on the node
    if(router == null) {
      if(rpNode.exits.length != 1) {
        throw new Error('The RapidPro node ' + rpNode.uuid + ' must have a single exit, since it does not have a router.')
      }
      return rpNode.exits[0].destination_uuid
    }
    // If there is a router but it has a single destination, and no wait step: these can also be merged
    else if(router.type === RPRouterType.switch) {
      const r = router as RPRouter_Switch
      if(r.categories.length == 1 && r.default_category_uuid == r.categories[0].uuid && r.wait == undefined) {
        const rpExit = rpNode.exits.find(e => e.uuid == r.categories[0].exit_uuid)
        if(rpExit == null) {
          throw new Error('The RapidPro exit node specified in the router ' + r.categories[0].exit_uuid + ' must exist.')
        }
        return rpExit.destination_uuid
      }
    }
    // There are multiple exits; no singleDestination found
    return null
  }



  /// Replace any destination exits that are RP Node UUIDs with their corresponding Flow Block UUIDs. These are prefixed with "rp:". We can only do this once all nodes/blocks are converted and created.
  protected convertRPUuidsToFIUuids() {
    for(let i=0; i<this.blocks.length; i++) {
      for(let j=0; j<this.blocks[i].exits.length; j++) {
        let exitUuid = this.blocks[i].exits[j].destination_block
        if(exitUuid && exitUuid.startsWith("rp:")) {
          this.blocks[i].exits[j].destination_block = this.rpUuidToFIUuid.get(exitUuid.substr(3))
        }
      }
    }
  }

  /// Convert a RapidPro node to Flow Interop blocks
  protected convertRPNodeToFIBlocks(rpNode: RPNode): IBlock[] {
    const blocks = new Array<IBlock>()
    const blockName = this.blockNameFromRPNode(rpNode)
    let i = rpNode.actions.length-1

    // Starting from the last action in the node:
    const enforcedType = this.detectLastBlockType(rpNode)
    // This case will happen in the case when there is a router with a wait, and no send_msg/play_msg/say_msg action.
    // Here we add an extra empty OpenResponse block to prompt for a response
    if(enforcedType === "ExtraEmptyOpenResponse") {
      blocks.push({
        uuid: rpNode.uuid,
        name: blockName,
        type: 'MobilePrimitives.OpenResponse',
        exits: this.convertRPRouterToBlockExits(rpNode),
        config: {
          prompt: this.addTextResource('[empty-fix-me]', rpNode.uuid)   // TODO: What happens in the case of IVR flows that have this situation (Router with wait, and no play_msg/say_msg ahead to prompt?)
        },
        ui_metadata: {
          canvas_coordinates: this.findCanvasLocation(rpNode)
        }
      } as IBlock)
    }
    // Otherwise, convert the last action and attach the router to it
    else if(rpNode.actions.length > 0) {
      const lastBlocks = this.convertRPActionToBlock(rpNode.actions[i], rpNode, blockName, enforcedType)
      lastBlocks[lastBlocks.length-1].exits = this.convertRPRouterToBlockExits(rpNode)
      blocks.push(...lastBlocks)
      i = i - 1
    }
    // Otherwise, if there is a router and no actions, convert the router to a Case block
    else if(rpNode.router) {
      blocks.push({
        uuid: rpNode.uuid,
        name: blockName,
        type: 'Core.Case',
        exits: this.convertRPRouterToBlockExits(rpNode),
        config: {}
      } as IBlock)
    }
    
    // Convert all remaining actions to blocks
    for(; i>=0; i--) {
      blocks.unshift(...this.convertRPActionToBlock(rpNode.actions[i], rpNode, blockName + '_' + i))
    }

    this.addSequentialLinkingExits(blocks)
    return blocks
  }

  /// Find the canvas coordinates of a RapidPro node
  protected findCanvasLocation(node: RPNode): IPoint {
    const rpLocation = this.rpFlow._ui?.nodes[node.uuid].position
    return {
      x: rpLocation.left,
      y: rpLocation.top
    }
  }

  /// Convert one RapidPro action to a Block
  protected convertRPActionToBlock(action: RPAction, node: RPNode, blockName: string, enforcedType?: string): IBlock[] {
    const blocks = [] as IBlock[]
    const type = enforcedType ? enforcedType : this.blockTypeFromRPActionType(action.type)
    let i = 1
    const ui_metadata = {
      canvas_coordinates: this.findCanvasLocation(node)
    }

    // Based on type:
    if(type === "Core.RunFlow") {
      // RP: flow.uuid, flow.name
      // FI: flow_id
      blocks.push({
        uuid: action.uuid,
        label: "Run " + action.flow.name,
        name: blockName,
        type: type,
        exits: [],
        config: {
          flow_id: action.flow.uuid
        },
        ui_metadata: ui_metadata
      } as IBlock)
    }

    else if(type === "MobilePrimitives.Message") {
      blocks.push({
        uuid: action.uuid,
        name: blockName,
        label: action.text,
        type: type,
        exits: [],
        config: {
          prompt: this.resourceFromRPAction(action)
        },
        ui_metadata: ui_metadata
      } as IBlock)
    }

    else if(type === "MobilePrimitives.OpenResponse") {
      blocks.push({
        uuid: action.uuid,
        name: blockName,
        label: action.text,
        type: type,
        exits: [],
        config: {
          prompt: this.resourceFromRPAction(action),
          max_duration_seconds: 10*60,  // TODO: find source for max_duration_seconds
        },
        ui_metadata: ui_metadata
      } as IBlock)
    }

    else if(type === "MobilePrimitives.DateResponse") {
      blocks.push({
        uuid: action.uuid,
        name: blockName,
        label: action.text,
        type: type,
        exits: [],
        config: {
          prompt: this.resourceFromRPAction(action)
          // TODO: find source for date format
        },
        ui_metadata: ui_metadata
      } as IBlock)
    }

    else if(type === "MobilePrimitives.NumericResponse") {
      blocks.push({
        uuid: action.uuid,
        name: blockName,
        label: action.text,
        type: type,
        exits: [],
        config: {
          prompt: this.resourceFromRPAction(action),
        },
        ui_metadata: ui_metadata
      } as IBlock)
    }

    else if(type === "MobilePrimitives.SelectOneResponse") {
      const block = {
        uuid: action.uuid,
        name: blockName,
        label: action.text,
        type: type,
        exits: [],
        config: {
          prompt: this.resourceFromRPAction(action),
        },
        ui_metadata: ui_metadata
      } as IBlock

      const choices: Record<string, any> = []
      // Need to get choices from the router. We include a choice per category defined on the router. TODO: What if there isn't a one-one mapping of cases to categories?
      // (Think that is OK, since SelectOne blocks are not required to have the same number of exits as choices)
      if(node.router && node.router.type === RPRouterType.switch) {
        const switchRouter = node.router as RPRouter_Switch
        switchRouter.categories.forEach(element => {
          choices[element.name] = this.addTextResource(element.name)
        });
      }

      blocks.push(block)
    }

    else if(type === "Core.Output") {
      // RP: flow.uuid, flow.name
      // FI: flow_id
      blocks.push({
        uuid: action.uuid,
        name: action.name,
        type: type,
        exits: [],
        config: {
          value: action.value
        },
        ui_metadata: ui_metadata
      } as IBlock)
    }

    else if(type === "Core.SetGroupMembership") {
      // RP: groups.uuid, groups.name
      // FI: group_key, group_name, is_member
      action.groups.forEach((group: any) => {
        blocks.push({
          uuid: uuidv4(), // TODO: Deterministically Repeatable solution?
          name: blockName + '_' + (i++),
          type: type,
          exits: [],
          config: {
            group_key: group.uuid,
            group_name: group.name,
            // false if action.type is "remove_contact_groups"
            is_member: (action.type === "add_contact_groups")
          },
          ui_metadata: ui_metadata
        } as IBlock)
      });
    }

    else if(type === "Core.SetContactProperty") {
      // RP: field.key, field.value
      // FI: set_contact_property.{property_key, property_value}

      blocks.push({
          uuid: uuidv4(), // TODO: Deterministically Repeatable solution?
          name: blockName + '_' + (i++),
          type: type,
          exits: [],
          config: {
            set_contact_property: {
              property_key: action.field.key,
              property_value: action.value,
            }
          },
          ui_metadata: ui_metadata
        } as IBlock)
    }

    else {
      throw new Error('The Flow Interop block type ' + type + ' is not yet supported in the converter, but has been requested. This should not happen.')
    }

    return blocks
  }

  protected slugified(input: string): string {
    return slugify(input, {replacement: '_', strict: true})
  }

  protected convertRPRouterToBlockExits(node: RPNode): IBlockExit[] {
    const exits: IBlockExit[] = []
    const router: RPRouter | undefined = node.router

    // If no router: there should be a single default exit on the node
    if(router == null) {
      if(node.exits.length != 1) {
        throw new Error('The RapidPro node ' + node.uuid + ' must have a single exit, since it does not have a router.')
      }
      exits.push({
        uuid: node.exits[0].uuid,
        destination_block: 'rp:' + node.exits[0].destination_uuid,
        name: 'Default',
        default: true,
        config: {}
      } as IBlockExit)
      return exits
    }
    else if(router.type === RPRouterType.switch) {
      const r = router as RPRouter_Switch
      r.categories.forEach(category => {
        const exit = {} as IBlockExit
        const rpExit = node.exits.find(e => e.uuid == category.exit_uuid)
        if(rpExit == null) {
          throw new Error('The RapidPro exit node specified in the router ' + category.exit_uuid + ' must exist.')
        }
        exit.uuid = rpExit.uuid
        exit.config = {}
        // This destination_block is, for now, an RP Node uuid. This will be converted later in this.convertRPUuidsToFIUuids:
        exit.destination_block = 'rp:' + rpExit.destination_uuid
        exit.name = category.name
        if(r.default_category_uuid == category.uuid) {
          exit.default = true
        }
        else {
          const expressions = r.cases.filter(c => (c.category_uuid == category.uuid))
                                    .map(rc => this.fiExpressionFromRPCase(rc, r.operand))
          exit.test = '@' + this.joinFIExpressionsWithOr(expressions)
        }
        
        exits.push(exit)
      });
    }
    else if(router.type === RPRouterType.random) {
      throw new Error('TODO: Implement support for random routers')
    }
    return exits
  }
  /**
   * Convert a RapidPro case definition to a Flow Interop expression, with no leading @
   * @param c RPRouterSwitchCase, like:
   * {
                  "arguments": [
                    "0",
                    "110"
                  ],
                  "type": "has_number_between",
                  "uuid": "3b48695a-5d90-4342-839b-c026cf34c2bb",
                  "category_uuid": "553d3ea7-ab9b-45e8-89fc-963d4edaa114"
                }
   * @param operand RapidPro switch router operand, like: @input.text
   * @returns Flow Interop expression, with no leading @.  Example: "has_number_between(block.value, 0, 110)"
   */
  protected fiExpressionFromRPCase(c: RPRouterSwitchCase, operand: string): string {
    // 1. convert arguments, if they exist
    let fiArguments = []
    if(c.arguments) {
      fiArguments = c.arguments.map((arg: any) => this.fiExpressionArgumentFromRPArgument(arg, true))
    }

    // 2. Convert operand
    fiArguments.unshift(this.fiExpressionArgumentFromRPArgument(operand))

    // 3. Construct expression
    return c.type + '(' + fiArguments.join(', ') + ')'
  }

  /**
   * Convert a RapidPro expression argument to a Flow Interop expression argument
   * @param rpArgument RapidPro argument, as found in an operand or within an RP expression
   * @returns Flow Interop expression argument
   */
  protected fiExpressionArgumentFromRPArgument(rpArgument: string, shouldQuote = false): string {

    // strip leading @, if any
    if(rpArgument.startsWith('@')) {
      rpArgument = rpArgument.substr(1)
    }
    // TODO: input.anything: change to FI format
    // TODO: map differences in context definition between RP and FI
    if(shouldQuote) {
      return '"' + rpArgument + '"'
    }
    else {
      return rpArgument
    }
    
  }

  /**
   * 
   * @param expressions Array of Flow Interop expressions to be joined within an OR()
   * @returns Flow Interop expression, without a leading @
   */
  protected joinFIExpressionsWithOr(expressions: string[]) {
    if(expressions.length == 0) {
      return 'true'
    }
    else if(expressions.length == 1) {
      return expressions[0]
    }
    else {
      return 'OR(' + expressions.join(', ') + ')'
    }
  }

  protected languagesFromRPFlow(): void {
    this.language_id = this.rpFlow.language
    this.languages.push({
      id: this.rpFlow.language,
      iso_639_3: this.rpFlow.language,
    } as ILanguage)
  }

  protected resourceFromRPAction(action: RPAction): string | undefined {
    if(action.type === "play_audio") {
      return this.addAudioResource(action.audio_url, undefined, action.uuid)
    }
    else if(action.type === "say_msg") {
      return this.addAudioResource(action.audio_url, action.text, action.uuid)
    }
    else if(action.type === "send_msg") {
      return this.addTextResource(action.text, action.uuid)
    }
    return undefined
  }

  protected addTextResource(text: string, uuid?: string): string {
    if(!uuid) {
      uuid = uuidv4()
    }

    this.resources.push({
      uuid: uuid,
      values: [
        {
          language_id: this.language_id,
          content_type: SupportedContentType.TEXT,
          mime_type: 'text/plain',
          modes: [SupportedMode.TEXT, SupportedMode.RICH_MESSAGING],
          value: text,
        }
      ]
    })

    return uuid
  }

  protected addAudioResource(audioUrl?: string, text?:string, uuid?: string): string {
    if(!uuid) {
      uuid = uuidv4()
    }

    const resourceValues = new Array<IResourceValue>()
    if(audioUrl) {
      resourceValues.push({
        language_id: this.language_id,
        content_type: SupportedContentType.AUDIO,
        modes: [SupportedMode.IVR],
        value: audioUrl,
      })
    }
    if(text) {
      resourceValues.push({
        language_id: this.language_id,
        content_type: SupportedContentType.TEXT,
        modes: [SupportedMode.IVR],
        value: text,
      })
    }

    this.resources.push({
      uuid: uuid,
      values: resourceValues
    })

    return uuid
  }

  protected blockNameFromRPNode(rpNode: RPNode): string {
    // Option 1: Get block name from router's result name
    if(rpNode.router && rpNode.router.type === RPRouterType.switch) {
      const router = rpNode.router as RPRouter_Switch
      return router.result_name
    }

    // Option 2: Find the last action that has a "text" property and slugify that
    for(let i=rpNode.actions.length-1; i>=0; i--) {
      if(rpNode.actions[i].text) {
        return this.slugified(rpNode.actions[i].text).substr(0, 48)
      }
    }

    // Option 3: Fallback to something from the uuid
    return "block_" + this.slugified(rpNode.uuid)
  }

  protected blockTypeFromRPActionType(actionType: string): string {
    switch(actionType) {
      case "add_contact_groups":
      case "remove_contact_groups": {
        return "Core.SetGroupMembership"
      }
      case "call_webhook": {
        return "Core.Webhook"
      }
      case "enter_flow": {
        return "Core.RunFlow"
      }
      case "say_msg": 
      case "send_msg":
      case "play_audio": {
        return "MobilePrimitives.Message"
      }
      case "set_contact_field": {
        return "Core.SetContactProperty"
      }
      case "set_run_result": {
        return "Core.Output"
      }
      default: {
        return "Unsupported"
      }
    }
  }

  /**
   * 
   * @param blocks Array of blocks to create default exits on, linking them together sequentially. The last block will not get an exit. Any exits[] on the first blocks will be replaced.
   */
  protected addSequentialLinkingExits(blocks: IBlock[]) {
    if(blocks.length == 0) {
      console.log("Warning: unexpected empty blocks")
      return
    }
    let lastUuid = blocks[blocks.length-1].uuid
    // All blocks ahead of the last block: connect exits to the subsequent block. Easy if we go backwards:
    for(let i=blocks.length-2; i>=0; i--) {
      blocks[i].exits = [{default: true, destination_block: lastUuid} as IBlockExit]
      lastUuid = blocks[i].uuid
    }
  }

  protected supportedModesFromRPMessagingType(messagingType: RPMessagingType): SupportedMode[] {
    switch(messagingType) {
      case RPMessagingType.messaging: {
        return [SupportedMode.RICH_MESSAGING, SupportedMode.TEXT]
      }
      case RPMessagingType.messaging_offline: {
        return [SupportedMode.OFFLINE]
      }
      case RPMessagingType.voice: {
        return [SupportedMode.IVR]
      }
    }
  }

  /**
   * Rules:
   * 1. If there is a router, and the router has a "wait" in it, then we'll need an interactive question block at the end.
   * 2. If there is a wait, and the last action is a message, replace it with <qType>
   * 3. If there is a wait, and the last action was not a message, add an OpenQuestion with an empty prompt.
   * 4. If there is no router, or there is a router with no wait, return null here. 
   * 5. <qType> is:
   *     All tests are has_number_*: Numeric
   *     All tests are has_data_*: DateQuestion
   *     All tests are ...
   * @param rpNode 
   */
  protected detectLastBlockType(rpNode: RPNode): string | undefined {
    if(!rpNode.router) {
      return undefined
    }
    if(rpNode.router.type !== "switch") {
      return undefined
    }
    const switchRouter = rpNode.router as RPRouter_Switch
    if(!switchRouter.wait) { 
      return undefined
    }

    // This router has a wait, so we will need an interactive block.

    // If there are no actions, we'll need to insert an empty question block to wait for a response
    if(rpNode.actions.length == 0) {
      return "ExtraEmptyOpenResponse"
    }
    
    const lastActionType = rpNode.actions[rpNode.actions.length-1].type
    // There isn't a message as the last action. We'll need to insert an empty OpenQuestion at the end to make it interactive. Ideally this isn't a frequent case. 
    if(!(lastActionType == RPActionType.send_msg || lastActionType == RPActionType.play_audio || lastActionType == RPActionType.say_msg)) {
      return "ExtraEmptyOpenResponse"
    }
    
    // This router has a wait, and a message at the end. What is the best type of question block to use?
    if(switchRouter.cases.length > 0) {
      if(this.allTestsAreForDates(switchRouter.cases)) {
        return "MobilePrimitives.DateResponse"
      }
      if(this.allTestsAreForNumbers(switchRouter.cases)) {
        return "MobilePrimitives.NumericResponse"
      }
      if(this.allTestsAreForChoices(switchRouter.cases)) {
        return "MobilePrimitives.SelectOneResponse"
      }
    }

    return "MobilePrimitives.OpenResponse"
  }

  protected allTestsAreForNumbers(tests: RPRouterSwitchCase[]): boolean {
    for(let i=0; i<tests.length; i++) {
      let test = tests[i]
      if(!(test.type == RPRouterSwitchTestType.has_number
        || test.type == RPRouterSwitchTestType.has_number_between
        || test.type == RPRouterSwitchTestType.has_number_eq
        || test.type == RPRouterSwitchTestType.has_number_gt
        || test.type == RPRouterSwitchTestType.has_number_gte
        || test.type == RPRouterSwitchTestType.has_number_lt
        || test.type == RPRouterSwitchTestType.has_number_lte
        )) {
        return false
      }
    }
    return true
  }

  protected allTestsAreForDates(tests: RPRouterSwitchCase[]) {
    for(let i=0; i<tests.length; i++) {
      let test = tests[i]
      if(!(test.type == RPRouterSwitchTestType.has_date
            || test.type == RPRouterSwitchTestType.has_date_eq
            || test.type == RPRouterSwitchTestType.has_date_gt
            || test.type == RPRouterSwitchTestType.has_date_lt
            )) {
        return false
      }
    }
    return true
  }

  protected allTestsAreForChoices(tests: RPRouterSwitchCase[]) {
    for(let i=0; i<tests.length; i++) {
      let test = tests[i]
      if(!(test.type == RPRouterSwitchTestType.has_pattern
            || test.type == RPRouterSwitchTestType.has_all_words
            || test.type == RPRouterSwitchTestType.has_any_word
            || test.type == RPRouterSwitchTestType.has_beginning
            || test.type == RPRouterSwitchTestType.has_only_phrase
            || test.type == RPRouterSwitchTestType.has_only_text
            )) {
        return false
      }
    }
    return true
  }




}