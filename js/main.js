const lowestGap = -1.000; // Store as a number instead of a string

$(window).bind("load", async function () {
    async function fetchPrices() {
        try {
            const spotResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=HIVEUSDT');
            const futureResponse = await fetch('https://fapi.binance.com/fapi/v1/ticker/price?symbol=HIVEUSDT');

            const spotData = await spotResponse.json();
            const futureData = await futureResponse.json();

            const spotPrice = parseFloat(spotData.price).toFixed(5);
            const futurePrice = parseFloat(futureData.price).toFixed(5);

            const indexGap = await calcIndexGap(spotPrice, futurePrice);
            
            $("#spotPrice").text(`$${spotPrice}`);
            $("#futurePrice").text(`$${futurePrice}`);
            $("#indexGap").text(`${indexGap}%`);

            // Apply color based on lowestGap threshold
            if (parseFloat(indexGap) < lowestGap) {
                $("#indexGap").css("color", "#00FF7F");
            } else {
                $("#indexGap").css("color", "red");
            }
        } catch (error) {
            $("#spotPrice").text('Error fetching data');
            $("#futurePrice").text('Error fetching data');
            $("#indexGap").text('Error calculating gap').css("color", "white");
            console.error('Error at fetchPrices():', error);
        }
    }

    // Manual refresh when clicking the button
    $(".refreshPrice").on("click", async function () {
        console.log("Refreshing Prices...");
        await fetchPrices();
        console.log("Prices Refreshed!");
    });

    async function calcIndexGap(spotPrice, futurePrice) {
        try {
            return parseFloat(((futurePrice / spotPrice) - 1) * 100).toFixed(5);
        } catch (error) {
            console.error('Error at calcIndexGap():', error);
            return "0.000";
        }
    }

    // Initial fetch
    fetchPrices();

    // Auto-refresh prices every 7 seconds
    setInterval(fetchPrices, 7000);
});