import { RPFlow } from '..'
import Ajv, { ErrorObject } from 'ajv'

/**
 * Validate a RapidPro Flow and return a set of errors (if they exist).
 * This checks that the structure of the RapidPro flow container is valid according to the goflow spec.
 * @param rpFlow : The result of calling JSON.parse() on the goflow flow json
 * @returns null if there are no errors, or a set of validation errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRapidProStructureErrors(rpFlow: RPFlow): ErrorObject<string, Record<string, any>, unknown>[] | null | undefined {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rapidProJsonSchema = require('../../dist/resources/rapidProJsonSchema.json')
  const ajv = new Ajv()
  const validate = ajv.compile(rapidProJsonSchema)
  if (!validate(rpFlow)) {
    return validate.errors
  }

  return null
}
