import { getRapidProStructureErrors } from '../..'

describe('Validation Usage Tests', () => {
  test('Valid Usage Example', async () => {
    const flowJson = `{
        "name": "Summary Case Report Test",
        "uuid": "630aed00-f07a-4506-9196-8c77d892cfc9",
        "spec_version": "13.1.0",
        "language": "eng",
        "type": "messaging",
        "nodes": [
          {
            "uuid": "8dc74044-519d-4117-badb-59921b33afaf",
            "actions": [
              {
                "attachments": [],
                "text": "This is the Summary Case Report Form. Please provide the patient's Unique Identifier.",
                "type": "send_msg",
                "all_urns": false,
                "quick_replies": [],
                "uuid": "2a901d3a-0ff0-40d8-b1b8-866e2dc49790"
              }
            ],
            "exits": [
              {
                "uuid": "54782fff-6350-4c1a-b823-5aaf72eed032",
                "destination_uuid": "bc7d3db9-e1f4-4b35-97e9-e7417c0f2723"
              }
            ]
          },
          {
            "uuid": "bc7d3db9-e1f4-4b35-97e9-e7417c0f2723",
            "actions": [],
            "router": {
              "type": "switch",
              "default_category_uuid": "bed084fc-137a-4025-b8e3-9fe7891df36d",
              "cases": [],
              "categories": [
                {
                  "uuid": "bed084fc-137a-4025-b8e3-9fe7891df36d",
                  "name": "All Responses",
                  "exit_uuid": "0d3337d6-b4f7-4c8a-a4ac-f6552e2bd070"
                }
              ],
              "operand": "@input.text",
              "wait": {
                "type": "msg"
              },
              "result_name": "patient_id"
            },
            "exits": [
              {
                "uuid": "0d3337d6-b4f7-4c8a-a4ac-f6552e2bd070",
                "destination_uuid": "19481505-d31e-4d85-a3ca-ea09fe997f8a"
              }
            ]
          },
          {
            "uuid": "19481505-d31e-4d85-a3ca-ea09fe997f8a",
            "actions": [
              {
                "attachments": [],
                "text": "Please provide the age of the patient in YEARS. If under age one, put 0.",
                "type": "send_msg",
                "quick_replies": [],
                "uuid": "a19a1201-e1cc-4f52-a293-066d339b5f15"
              }
            ],
            "exits": [
              {
                "uuid": "db08bc07-2fc4-48b7-9ba8-0233e3bddc78",
                "destination_uuid": "acf0d621-658e-42e1-93b7-592147453a39"
              }
            ]
          },
          {
            "uuid": "acf0d621-658e-42e1-93b7-592147453a39",
            "actions": [],
            "router": {
              "type": "switch",
              "default_category_uuid": "d0ada553-7e01-4057-b7e6-dbe28292c38b",
              "cases": [
                {
                  "arguments": [
                    "0",
                    "110"
                  ],
                  "type": "has_number_between",
                  "uuid": "3b48695a-5d90-4342-839b-c026cf34c2bb",
                  "category_uuid": "553d3ea7-ab9b-45e8-89fc-963d4edaa114"
                }
              ],
              "categories": [
                {
                  "uuid": "553d3ea7-ab9b-45e8-89fc-963d4edaa114",
                  "name": "Has Number",
                  "exit_uuid": "430618c8-9bd4-41cd-bb3d-c9543b2ceb90"
                },
                {
                  "uuid": "d0ada553-7e01-4057-b7e6-dbe28292c38b",
                  "name": "Other",
                  "exit_uuid": "bc4944ab-8ae0-495b-b542-6ed824539d06"
                }
              ],
              "operand": "@input.text",
              "wait": {
                "type": "msg"
              },
              "result_name": "patient_age"
            },
            "exits": [
              {
                "uuid": "430618c8-9bd4-41cd-bb3d-c9543b2ceb90",
                "destination_uuid": "d4bceb25-fb1a-4d4e-b094-10ed63b5954b"
              },
              {
                "uuid": "bc4944ab-8ae0-495b-b542-6ed824539d06",
                "destination_uuid": "19481505-d31e-4d85-a3ca-ea09fe997f8a"
              }
            ]
          },
          {
            "uuid": "d4bceb25-fb1a-4d4e-b094-10ed63b5954b",
            "actions": [
              {
                "attachments": [],
                "text": "What is the date of first laboratory confirmation test? Please specify as DD/MM/YEAR,  e.g. 01052021.",
                "type": "send_msg",
                "quick_replies": [],
                "uuid": "4acdb4f3-2a96-428d-ad0d-87dd1d04f1a2"
              }
            ],
            "exits": [
              {
                "uuid": "dd359e95-a26f-4505-862f-95d7c836a949",
                "destination_uuid": "6399d220-a4f8-4274-8224-a8a31aa3c36d"
              }
            ]
          },
          {
            "uuid": "f2b80452-4b6f-4ebd-b8b8-96fe28b40a98",
            "actions": [
              {
                "attachments": [],
                "text": "Thank you. You provided Identifier (@results.patient_id), Age (@results.patient_age), and Test Date (@results.patient_test_date)",
                "type": "send_msg",
                "quick_replies": [],
                "uuid": "161642bb-4073-442f-8470-5b4b9922bc49"
              }
            ],
            "exits": [
              {
                "uuid": "06d11255-3706-4845-89ed-b7399b6b0648",
                "destination_uuid": null
              }
            ]
          },
          {
            "uuid": "6399d220-a4f8-4274-8224-a8a31aa3c36d",
            "actions": [],
            "router": {
              "type": "switch",
              "default_category_uuid": "85aaa8da-e8e3-4aba-9d68-fcbfb4041d38",
              "cases": [
                {
                  "arguments": [],
                  "type": "has_date",
                  "uuid": "aa4712db-11ff-49ab-aa75-4509ba884f57",
                  "category_uuid": "429674cb-31e3-486a-98d9-4d14c10d35c5"
                }
              ],
              "categories": [
                {
                  "uuid": "429674cb-31e3-486a-98d9-4d14c10d35c5",
                  "name": "Has Number",
                  "exit_uuid": "cf7bd0b9-4190-4f74-819a-475212d32a5f"
                },
                {
                  "uuid": "85aaa8da-e8e3-4aba-9d68-fcbfb4041d38",
                  "name": "Other",
                  "exit_uuid": "e3c8874c-df2b-4ef0-9236-d03004b5b1d5"
                }
              ],
              "operand": "@input.text",
              "wait": {
                "type": "msg"
              },
              "result_name": "patient_test_date"
            },
            "exits": [
              {
                "uuid": "cf7bd0b9-4190-4f74-819a-475212d32a5f",
                "destination_uuid": "f2b80452-4b6f-4ebd-b8b8-96fe28b40a98"
              },
              {
                "uuid": "e3c8874c-df2b-4ef0-9236-d03004b5b1d5",
                "destination_uuid": "d4bceb25-fb1a-4d4e-b094-10ed63b5954b"
              }
            ]
          }
        ],
        "_ui": {
          "nodes": {
            "8dc74044-519d-4117-badb-59921b33afaf": {
              "position": {
                "left": 140,
                "top": 0
              },
              "type": "execute_actions"
            },
            "bc7d3db9-e1f4-4b35-97e9-e7417c0f2723": {
              "type": "wait_for_response",
              "position": {
                "left": 140,
                "top": 140
              },
              "config": {
                "cases": {}
              }
            },
            "19481505-d31e-4d85-a3ca-ea09fe997f8a": {
              "position": {
                "left": 420,
                "top": 180
              },
              "type": "execute_actions"
            },
            "acf0d621-658e-42e1-93b7-592147453a39": {
              "type": "wait_for_response",
              "position": {
                "left": 420,
                "top": 320
              },
              "config": {
                "cases": {}
              }
            },
            "d4bceb25-fb1a-4d4e-b094-10ed63b5954b": {
              "position": {
                "left": 620,
                "top": 480
              },
              "type": "execute_actions"
            },
            "6399d220-a4f8-4274-8224-a8a31aa3c36d": {
              "type": "wait_for_response",
              "position": {
                "left": 620,
                "top": 640
              },
              "config": {
                "cases": {}
              }
            },
            "f2b80452-4b6f-4ebd-b8b8-96fe28b40a98": {
              "position": {
                "left": 1020,
                "top": 540
              },
              "type": "execute_actions"
            }
          }
        },
        "revision": 76,
        "expire_after_minutes": 10080,
        "metadata": {
          "expires": 10080
        },
        "localization": {}
      }`

    const container = JSON.parse(flowJson)
    const errors = getRapidProStructureErrors(container)
    // console.log(response);
    expect(errors).toEqual(null)
  })
})