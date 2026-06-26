from flask import Flask, request, jsonify
import os
import json

from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient


app = Flask(__name__)


# Azure AI Foundry project endpoint
endpoint = os.getenv(
    "AZURE_PROJECT_ENDPOINT",
    "https://hiremind-ai-dev-resource.services.ai.azure.com/api/projects/hiremind-ai-dev"
)


workflow_name = os.getenv(
    "AZURE_WORKFLOW_NAME",
    "temp"
)


# Create Azure client
project_client = AIProjectClient(
    endpoint=endpoint,
    credential=DefaultAzureCredential()
)


openai_client = project_client.get_openai_client()



@app.route("/run-workflow", methods=["POST"])
def run_workflow():

    try:

        # Get request from Node backend
        data = request.json


        if not data:
            return jsonify({
                "error": "No input received"
            }), 400



        job_description = data.get("job_description")

        candidates = data.get("candidates")



        if not job_description or not candidates:

            return jsonify({
                "error": "job_description and candidates are required"
            }), 400



        # Convert input into JSON string
        workflow_input = json.dumps({

            "job_description": job_description,

            "candidates": candidates

        })



        print("Sending to Azure workflow:")
        print(workflow_input)



        # Create conversation
        conversation = openai_client.conversations.create()



        # Run workflow
        response = openai_client.responses.create(

            conversation=conversation.id,

            extra_body={

                "agent_reference": {

                    "name": workflow_name,

                    "type": "agent_reference"

                }

            },

            input=workflow_input

        )



        result = response.output_text



        print("Azure response:")
        print(result)



        # Delete conversation
        openai_client.conversations.delete(
            conversation_id=conversation.id
        )



        return jsonify({

            "result": result

        })



    except Exception as e:


        print("ERROR:", str(e))


        return jsonify({

            "error": str(e)

        }), 500




if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )