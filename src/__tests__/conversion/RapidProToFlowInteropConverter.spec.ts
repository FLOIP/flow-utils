import { RapidProToFlowInteropConverter } from '../..'

describe('Conversion Usage Tests', () => {
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

    const converter = new RapidProToFlowInteropConverter(flowJson)
    const result = converter.convert()

    if(result.isOk()) {
      console.log(result.value)
    }
    else {
      console.log("Error: " + result.error)
    }
    
    expect(result.isOk()).toEqual(true)
  }),

  test('Valid Usage Example 2', async () => {
    const flowJson = `{
      "name": "Basic RapidPro - Flow Interop Test",
      "uuid": "4ff6b8a2-4e87-4383-853f-407334dd9dfa",
      "spec_version": "13.1.0",
      "language": "base",
      "type": "messaging",
      "nodes": [
        {
          "uuid": "f55dfb35-6c6b-4883-8a21-843613cee9cd",
          "actions": [
            {
              "attachments": [],
              "text": "Welcome to Flowida's Restaurant! Here you can place your order to be ready for when you eat.",
              "type": "send_msg",
              "quick_replies": [],
              "uuid": "c0eb929e-8cb0-45bd-826f-9c0a0e3b988c"
            }
          ],
          "exits": [
            {
              "uuid": "d08bbf15-ac6a-42e5-b257-8982252d7d29",
              "destination_uuid": "be8e320a-739c-4c60-8046-312e3981521c"
            }
          ]
        },
        {
          "uuid": "be8e320a-739c-4c60-8046-312e3981521c",
          "actions": [
            {
              "attachments": [],
              "text": "What would you like to order for dinner? Reply 1 for Pizza, 2 for Spaghetti, and 3 for the House Special.",
              "type": "send_msg",
              "all_urns": false,
              "quick_replies": [],
              "uuid": "bd6274bf-5f22-4394-8ae7-ea3c8143a4f0"
            }
          ],
          "exits": [
            {
              "uuid": "7e9f5468-b689-4541-b8bf-5e02846f74de",
              "destination_uuid": "2e7b76ad-eb0f-48af-b1cd-5c02b489dc32"
            }
          ]
        },
        {
          "uuid": "aca93eae-08c0-43c7-a2c9-bdcaa4671d5b",
          "actions": [
            {
              "attachments": [],
              "text": "Sorry, we didn't understand that message!",
              "type": "send_msg",
              "quick_replies": [],
              "uuid": "78f8b5ef-7f4f-42c2-8f3a-bb2c85649609"
            }
          ],
          "exits": [
            {
              "uuid": "be59a73d-5507-4a15-9d29-501d17c0f741",
              "destination_uuid": "be8e320a-739c-4c60-8046-312e3981521c"
            }
          ]
        },
        {
          "uuid": "2e7b76ad-eb0f-48af-b1cd-5c02b489dc32",
          "actions": [],
          "router": {
            "type": "switch",
            "default_category_uuid": "5c76fae1-f7ae-4c1c-843a-fa5154ddd629",
            "cases": [
              {
                "arguments": [
                  "pizza"
                ],
                "type": "has_phrase",
                "uuid": "9e68a03c-cc9f-4658-af7c-a65323d56bef",
                "category_uuid": "1ff95e19-804c-404c-b14b-b1dcfe360b74"
              },
              {
                "arguments": [
                  "spaghetti"
                ],
                "type": "has_phrase",
                "uuid": "e686f9b2-e3ff-4e58-8263-0af7ec78bdef",
                "category_uuid": "f7d44569-f249-445b-af4e-c3a75dad5dfa"
              },
              {
                "arguments": [
                  "house special"
                ],
                "type": "has_any_word",
                "uuid": "917fa0da-88a7-4032-b8f1-0513a0741cce",
                "category_uuid": "fe3cb6f6-d548-491d-af2c-0ab5aa628e7e"
              },
              {
                "arguments": [
                  "1"
                ],
                "type": "has_phrase",
                "uuid": "576b6e5d-559a-4442-8ba4-e25f7af4edc9",
                "category_uuid": "1ff95e19-804c-404c-b14b-b1dcfe360b74"
              },
              {
                "arguments": [
                  "2"
                ],
                "type": "has_phrase",
                "uuid": "568b47b3-f654-4af8-ad3d-c5c2f1459964",
                "category_uuid": "f7d44569-f249-445b-af4e-c3a75dad5dfa"
              },
              {
                "arguments": [
                  "3"
                ],
                "type": "has_phrase",
                "uuid": "1b15c68f-d8ad-4d27-8186-ae5a04821055",
                "category_uuid": "fe3cb6f6-d548-491d-af2c-0ab5aa628e7e"
              }
            ],
            "categories": [
              {
                "uuid": "1ff95e19-804c-404c-b14b-b1dcfe360b74",
                "name": "Pizza",
                "exit_uuid": "17f0d4ea-4006-49e7-9597-1e7fb0174241"
              },
              {
                "uuid": "f7d44569-f249-445b-af4e-c3a75dad5dfa",
                "name": "Spaghetti",
                "exit_uuid": "aa7d122b-7529-4265-bc12-83ec200ca875"
              },
              {
                "uuid": "fe3cb6f6-d548-491d-af2c-0ab5aa628e7e",
                "name": "HouseSpecial",
                "exit_uuid": "e69fe44a-b5fe-4ee8-8e3a-4f36512d0433"
              },
              {
                "uuid": "5c76fae1-f7ae-4c1c-843a-fa5154ddd629",
                "name": "Other",
                "exit_uuid": "2a6b4f8a-5cc4-4030-9d7f-8aece583e05a"
              }
            ],
            "operand": "@input.text",
            "wait": {
              "type": "msg"
            },
            "result_name": "dinner_order"
          },
          "exits": [
            {
              "uuid": "17f0d4ea-4006-49e7-9597-1e7fb0174241",
              "destination_uuid": "bb06ca34-faf7-481b-9945-9e5092fab0bb"
            },
            {
              "uuid": "aa7d122b-7529-4265-bc12-83ec200ca875",
              "destination_uuid": "bb06ca34-faf7-481b-9945-9e5092fab0bb"
            },
            {
              "uuid": "e69fe44a-b5fe-4ee8-8e3a-4f36512d0433",
              "destination_uuid": "bb06ca34-faf7-481b-9945-9e5092fab0bb"
            },
            {
              "uuid": "2a6b4f8a-5cc4-4030-9d7f-8aece583e05a",
              "destination_uuid": "aca93eae-08c0-43c7-a2c9-bdcaa4671d5b"
            }
          ]
        },
        {
          "uuid": "bb06ca34-faf7-481b-9945-9e5092fab0bb",
          "actions": [
            {
              "attachments": [],
              "text": "Thanks for your order! Would you like to save this order as your favorite for the future? Reply 1 for Yes or 2 for No.",
              "type": "send_msg",
              "quick_replies": [],
              "uuid": "27af6b90-ecaa-4ed8-9fba-2bcc59374799"
            }
          ],
          "exits": [
            {
              "uuid": "2b792c7b-7596-4419-9fb6-3ea8c6b0f79a",
              "destination_uuid": "962a88b6-5bcb-4eae-857e-3aa3e6535ddf"
            }
          ]
        },
        {
          "uuid": "962a88b6-5bcb-4eae-857e-3aa3e6535ddf",
          "actions": [],
          "router": {
            "type": "switch",
            "default_category_uuid": "894fea5d-6b79-434a-a430-4b77184635dc",
            "cases": [
              {
                "arguments": [
                  "Yes"
                ],
                "type": "has_phrase",
                "uuid": "0808ff0e-3dbe-4988-871a-53fb9e6e4dc5",
                "category_uuid": "8926ab3b-b78b-460e-ae63-645e9d29d855"
              },
              {
                "arguments": [
                  "No"
                ],
                "type": "has_phrase",
                "uuid": "0cc634ac-529c-44a2-99cf-06d3decf59c7",
                "category_uuid": "59c18875-d92b-414a-bfe9-d9cc59ca37b2"
              },
              {
                "arguments": [
                  "1"
                ],
                "type": "has_only_phrase",
                "uuid": "ce86f8c3-a5ba-45a2-8d6a-457b6d66c751",
                "category_uuid": "8926ab3b-b78b-460e-ae63-645e9d29d855"
              },
              {
                "arguments": [
                  "2"
                ],
                "type": "has_only_phrase",
                "uuid": "9798afb2-470c-496f-a004-cf05428057e1",
                "category_uuid": "59c18875-d92b-414a-bfe9-d9cc59ca37b2"
              }
            ],
            "categories": [
              {
                "uuid": "8926ab3b-b78b-460e-ae63-645e9d29d855",
                "name": "Yes",
                "exit_uuid": "11b0b95f-d2a8-48e8-a752-5822de6ddb0c"
              },
              {
                "uuid": "59c18875-d92b-414a-bfe9-d9cc59ca37b2",
                "name": "No",
                "exit_uuid": "b3fde89a-681c-4fcd-9e68-7cb7fd17261a"
              },
              {
                "uuid": "894fea5d-6b79-434a-a430-4b77184635dc",
                "name": "Other",
                "exit_uuid": "66388750-6ba6-48f2-9003-079ad7a7f419"
              }
            ],
            "operand": "@input.text",
            "wait": {
              "type": "msg"
            },
            "result_name": "should_save_favorite"
          },
          "exits": [
            {
              "uuid": "11b0b95f-d2a8-48e8-a752-5822de6ddb0c",
              "destination_uuid": "f7b9b853-0113-494b-aaf7-160a07a221de"
            },
            {
              "uuid": "b3fde89a-681c-4fcd-9e68-7cb7fd17261a",
              "destination_uuid": "169c0267-a83f-457e-9f32-5cac8efdf850"
            },
            {
              "uuid": "66388750-6ba6-48f2-9003-079ad7a7f419",
              "destination_uuid": null
            }
          ]
        },
        {
          "uuid": "f7b9b853-0113-494b-aaf7-160a07a221de",
          "actions": [
            {
              "uuid": "3aebc12a-7849-4f11-aa96-148f68727f97",
              "type": "set_contact_field",
              "field": {
                "name": "favorite-dinner-order",
                "key": "favorite_dinner_order"
              },
              "value": "@results.dinner_order"
            }
          ],
          "exits": [
            {
              "uuid": "cb257439-5b16-4bf3-82f1-d7d288787db0",
              "destination_uuid": "169c0267-a83f-457e-9f32-5cac8efdf850"
            }
          ]
        },
        {
          "uuid": "169c0267-a83f-457e-9f32-5cac8efdf850",
          "actions": [
            {
              "attachments": [],
              "text": "Thanks for your order! We'll let you know when it's ready!",
              "type": "send_msg",
              "quick_replies": [],
              "uuid": "5b1501d8-d105-4867-b71d-c0ce65601384"
            }
          ],
          "exits": [
            {
              "uuid": "4942263e-6ccc-4a5c-81ec-f96301b2fa5e",
              "destination_uuid": null
            }
          ]
        }
      ],
      "_ui": {
        "nodes": {
          "f55dfb35-6c6b-4883-8a21-843613cee9cd": {
            "position": {
              "left": 0,
              "top": 0
            },
            "type": "execute_actions"
          },
          "be8e320a-739c-4c60-8046-312e3981521c": {
            "position": {
              "left": 220,
              "top": 0
            },
            "type": "execute_actions"
          },
          "2e7b76ad-eb0f-48af-b1cd-5c02b489dc32": {
            "type": "wait_for_response",
            "position": {
              "left": 540,
              "top": 20
            },
            "config": {
              "cases": {}
            }
          },
          "aca93eae-08c0-43c7-a2c9-bdcaa4671d5b": {
            "position": {
              "left": 880,
              "top": 0
            },
            "type": "execute_actions"
          },
          "bb06ca34-faf7-481b-9945-9e5092fab0bb": {
            "position": {
              "left": 580,
              "top": 180
            },
            "type": "execute_actions"
          },
          "962a88b6-5bcb-4eae-857e-3aa3e6535ddf": {
            "type": "wait_for_response",
            "position": {
              "left": 580,
              "top": 340
            },
            "config": {
              "cases": {}
            }
          },
          "f7b9b853-0113-494b-aaf7-160a07a221de": {
            "position": {
              "left": 340,
              "top": 380
            },
            "type": "execute_actions"
          },
          "169c0267-a83f-457e-9f32-5cac8efdf850": {
            "position": {
              "left": 540,
              "top": 500
            },
            "type": "execute_actions"
          }
        }
      },
      "revision": 78,
      "expire_after_minutes": 10080,
      "metadata": {
        "expires": 10080
      },
      "localization": {}
    }`

    const converter = new RapidProToFlowInteropConverter(flowJson)
    const result = converter.convert()

    if(result.isOk()) {
      console.log(result.value)
    }
    else {
      console.log("Error: " + result.error)
    }
    
    expect(result.isOk()).toEqual(true)
  })
})