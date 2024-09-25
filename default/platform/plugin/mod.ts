import axios from 'axios';

export async function myCustomDataSource(inputString: string): Promise<string> {
    const inputJson = JSON.parse(inputString);
    
    const url = 'https://www.geberit.fr/produits-de-salle-de-bains/inspiration/conseils/';
    
    try {
        // Step 1: Fetch the webpage
        const response = await axios.get(url);

        // Step 2: Find the script tag containing the JSON data by its ID
        const scriptTagMatch = response.data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        
        if (scriptTagMatch) {
            try {
                // Step 3: Load JSON content from the script tag
                const jsonData = JSON.parse(scriptTagMatch[1]);

                // Step 4: Navigate to the tiles
                const tiles = jsonData.props.pageProps.page.contentAreas.content[1].tiles;

                // Step 5: Extract tile information
                const tileItems = tiles.map((tile: any) => {
                    if (tile.type === 'tile_item') {
                        return {
                            title: tile.title,
                            content: tile.content,
                            picture_url: 'https://geberit.fr' + tile.pictureObject.url,
                            cta_label: tile.link.text,
                            cta_url: 'https://geberit.fr' + tile.link.target
                        };
                    }
                }).filter(Boolean); // Filter out any undefined values

                // Create the output JSON structure
                const output = {
                    data: tileItems,
                    nextPageToken: null // No pagination needed
                };

                // Return the stringified JSON output
                return JSON.stringify(output);

            } catch (error) {
                console.error("Error: Failed to decode JSON from the script tag.", error);
                return JSON.stringify({ data: [], nextPageToken: null });
            }
        } else {
            console.error("Error: No script tag containing JSON data was found.");
            return JSON.stringify({ data: [], nextPageToken: null });
        }
    } catch (error) {
        console.error("Error fetching the webpage:", error);
        return JSON.stringify({ data: [], nextPageToken: null });
    }
}

// Testing the function
(async () => {
    const input = JSON.stringify({ pageToken: "" }); // Sample input for testing
    const result = await myCustomDataSource(input);
    console.log("Result:", result);
})();