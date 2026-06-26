const axios = require("axios");


const runWorkflow = async (req, res) => {
    try {

        console.log("AI request received");


        // 1. Prepare clean input
        const payload = {
            job_description: req.body.job_description,
            candidates: req.body.candidates
        };


        // 2. Call Python Azure workflow service
        const response = await axios.post(
            process.env.PYTHON_AI_URL,
            payload
        );


        const raw = response.data.result;


        console.log("Raw AI response:");
        console.log(raw);



        // 3. Extract JSON blocks from Azure response
        const jsonBlocks = raw.match(
            /\{[\s\S]*?\}(?=\s*\{|\s*$)/g
        );


        const finalOutput = {
            job_description: "",
            candidates: [],
            results: [],
            ranked_results: []
        };


        if (jsonBlocks) {

            jsonBlocks.forEach(block => {

                try {

                    const parsed = JSON.parse(block);


                    if (parsed.job_description) {
                        finalOutput.job_description =
                            parsed.job_description;
                    }


                    if (parsed.candidates) {
                        finalOutput.candidates =
                            parsed.candidates;
                    }


                    if (parsed.results) {
                        finalOutput.results =
                            parsed.results;
                    }


                    if (parsed.ranked_results) {
                        finalOutput.ranked_results =
                            parsed.ranked_results;
                    }


                } catch(error) {

                    console.log(
                        "Skipping invalid JSON block"
                    );

                }

            });

        }



        // 4. Send clean response
        res.json({

            success: true,

            data: finalOutput

        });



    } catch(error) {


        console.error(
            "AI Controller Error:",
            error.message
        );


        res.status(500).json({

            success:false,

            error:error.message

        });

    }
};



module.exports = {
    runWorkflow
};