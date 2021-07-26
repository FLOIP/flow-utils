/* eslint-disable @typescript-eslint/camelcase */
export type RPUuid = string

export enum RPMessagingType {
  messaging = "messaging",
  messaging_offline = "messaging_offline",
  voice = "voice",
}

export interface RPExit {
  uuid: RPUuid,
  destination_uuid?: RPUuid | null,
}

export enum RPActionType {
  add_contact_groups = "add_contact_groups",
  add_contact_urn = "add_contact_urn",
  add_input_labels = "add_input_labels",
  call_classifier = "call_classifier",
  call_resthook = "call_resthook",
  call_webhook = "call_webhook",
  enter_flow = "enter_flow",
  open_ticket = "open_ticket",
  play_audio = "play_audio",
  remove_contact_groups = "remove_contact_groups",
  say_msg = "say_msg",
  send_broadcast = "send_broadcast",
  send_email = "send_email",
  send_msg = "send_msg",
  set_contact_channel = "set_contact_channel",
  set_contact_field = "set_contact_field",
  set_contact_language = "set_contact_language",
  set_contact_name = "set_contact_name",
  set_contact_status = "set_contact_status",
  set_contact_timezone = "set_contact_timezone",
  set_run_result = "set_run_result",
  start_session = "start_session",
  transfer_airtime = "transfer_airtime",
}

/**
 * @additionalProperties=true
 */
export interface RPAction extends Record<string, any> {
  uuid: RPUuid,
  type: RPActionType,
  attachments?: Record<string, any>[],
}

export enum RPRouterType {
  switch = "switch",
  random = "random",
}

export enum RPRouterWaitType {
  msg = "msg"
}

export interface RPRouterWait {
  type: RPRouterWaitType,
  timeout: number,
}

export interface RPRouterCategory {
  uuid: RPUuid,
  name: string,
  exit_uuid: RPUuid
}
export enum RPRouterSwitchTestType {
  has_all_words = "has_all_words",
  has_any_word = "has_any_word",
  has_beginning = "has_beginning",
  has_category = "has_category",
  has_date = "has_date",
  has_date_eq = "has_date_eq",
  has_date_gt = "has_date_gt",
  has_date_lt = "has_date_lt",
  has_district = "has_district",
  has_email = "has_email",
  has_error = "has_error",
  has_group = "has_group",
  has_intent = "has_intent",
  has_number = "has_number",
  has_number_between = "has_number_between",
  has_number_eq = "has_number_eq",
  has_number_gt = "has_number_gt",
  has_number_gte = "has_number_gte",
  has_number_lt = "has_number_lt",
  has_number_lte = "has_number_lte",
  has_only_phrase = "has_only_phrase",
  has_only_text = "has_only_text",
  has_pattern = "has_pattern",
  has_phone = "has_phone",
  has_phrase = "has_phrase",
  has_state = "has_state",
  has_text = "has_text",
  has_time = "has_time",
  has_top_intent = "has_top_intent",
  has_ward = "has_ward",
}

export interface RPRouterSwitchCase extends Record<string, any> {
  uuid: RPUuid,
  type: RPRouterSwitchTestType
  category_uuid: RPUuid
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface RPRouter_Switch {
  type: RPRouterType,
  wait: RPRouterWait,
  result_name: string,
  categories: RPRouterCategory[],
  operand: string,
  cases: RPRouterSwitchCase[]
  default_category_uuid: RPUuid
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface RPRouter_Random {
  type: RPRouterType,
  categories: RPRouterCategory[]
}

export type RPRouter = RPRouter_Switch | RPRouter_Random

export interface RPNode {
  uuid: RPUuid,
  actions: RPAction[],
  router?: RPRouter,
  exits: RPExit[]
}

export interface RPFlow {
  uuid: RPUuid,
  name: string,
  language: string,
  type: RPMessagingType,
  nodes: RPNode[],
  spec_version: string,
  revision: number,
  expire_after_minutes: number,
  metadata?: Record<string, any>,
  localization?: Record<string, any>,
  _ui?: Record<string, any>,
}