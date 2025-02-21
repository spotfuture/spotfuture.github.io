const lowestGapSpotFuture = -1.000; // Store as a number instead of a string
const lowestGapFutureSpot = -0.100; // Store as a number instead of a string

// Create an array of available indexes
const indexList = [-3.000, -2.000, -1.500, -1.000, -0.500, -0.300, -0.200, -0.100, 0.000, 0.100, 0.200, 0.300, 0.500, 1.000]; // Example values, you can add more

let lastUtcTime = ''; // Store last UTC time for comparison

$(window).bind("load", async function () {
    async function fetchPrices() {
        try {
            const spotResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=HIVEUSDT');
            const futureResponse = await fetch('https://fapi.binance.com/fapi/v1/ticker/price?symbol=HIVEUSDT');

            const spotData = await spotResponse.json();
            const futureData = await futureResponse.json();

            const spotPrice = parseFloat(spotData.price).toFixed(5);
            const futurePrice = parseFloat(futureData.price).toFixed(5);

            const indexGapSpotFuture = await calcIndexGapSpotFuture(spotPrice, futurePrice);
            const indexGapFutureSpot = await calcIndexGapFutureSpot(spotPrice, futurePrice);
            
            $("#spotPrice").text(`$${spotPrice}`);
            $("#futurePrice").text(`$${futurePrice}`);

            $("#indexGap1").text(`${indexGapSpotFuture}%`);            
            $("#indexGap2").text(`${indexGapFutureSpot}%`);

            // Apply color based on lowestGap threshold (SPOT to FUTURE)
            if (parseFloat(indexGapSpotFuture) < lowestGapSpotFuture) {
                $("#indexGap1").css("color", "#00FF7F"); // Green if gap is less than -1%
            } else {
                $("#indexGap1").css("color", "red");
            }

            // Apply color based on lowestGap threshold (FUTURE to SPOT)
            if (parseFloat(indexGapFutureSpot) < lowestGapFutureSpot) {
                $("#indexGap2").css("color", "#00FF7F"); // Green if gap is greater than -0.1%
            } else {
                $("#indexGap2").css("color", "red");
            }

            // Compare with selected index from dropdown
            await compareIndexGapWithDropdownSpotFuture(indexGapSpotFuture);
            await compareIndexGapWithDropdownFutureSpot(indexGapFutureSpot);

            // Update the UTC time
            updateUtcLastTime();
        } catch (error) {
            $("#spotPrice").text('Error fetching data');
            $("#futurePrice").text('Error fetching data');
            $("#indexGap1").text('Error calculating gap').css("color", "white");
            $("#indexGap2").text('Error calculating gap').css("color", "white");
            console.error('Error at fetchPrices():', error);
        }
    }

    /*
    * SPOT To FUTURE
    */
    function populateIndexDropdownSpotFuture() {
        const dropdown = $("#indexDropdown1");
        indexList.forEach(index => {
            const option = $("<option>").text(index).val(index);
            dropdown.append(option);
        });

        const savedIndex = localStorage.getItem('selectedIndex1');
        if (savedIndex) {
            dropdown.val(savedIndex);
        } else {
            dropdown.val(-1.000); // Default to -1.000
        }
    }

    $("#indexDropdown1").on("change", function() {
        const selectedIndex = $(this).val();
        localStorage.setItem('selectedIndex1', selectedIndex);
        
        const indexGap = $("#indexGap1").text().replace('%', ''); // Get the current Index Gap without '%'
        compareIndexGapWithDropdownSpotFuture(indexGap);
    });

    async function compareIndexGapWithDropdownSpotFuture(indexGap) {
        const selectedIndex = parseFloat($("#indexDropdown1").val());
        if (selectedIndex !== undefined) {
            if (parseFloat(indexGap) < selectedIndex) {
                $("#indexGap1").css("color", "#00FF7F");
            } else if (parseFloat(indexGap) > selectedIndex) {
                $("#indexGap1").css("color", "red");
            } else {
                $("#indexGap1").css("color", "yellow");
            }
        }
    }

    async function calcIndexGapSpotFuture(spotPrice, futurePrice) {
        try {
            let adjustedSpotPrice = spotPrice * 0.999;  // Spot sell (receive less)
            let adjustedFuturePrice = futurePrice * 1.0005; // Future buy (pay more)
            return parseFloat(((adjustedFuturePrice - adjustedSpotPrice) / adjustedSpotPrice) * 100).toFixed(5);
        } catch (error) {
            console.error('Error at calcIndexGapSpotFuture():', error);
            return "0.000";
        }
    }

    /*
    * FUTURE To SPOT
    */
    function populateIndexDropdownFutureSpot() {
        const dropdown = $("#indexDropdown2");
        indexList.forEach(index => {
            const option = $("<option>").text(index).val(index);
            dropdown.append(option);
        });

        const savedIndex = localStorage.getItem('selectedIndex2');
        if (savedIndex) {
            dropdown.val(savedIndex);
        } else {
            dropdown.val(-1.000); // Default to -1.000
        }
    }

    $("#indexDropdown2").on("change", function() {
        const selectedIndex = $(this).val();
        localStorage.setItem('selectedIndex2', selectedIndex);
        
        const indexGap = $("#indexGap2").text().replace('%', ''); // Get the current Index Gap without '%'
        compareIndexGapWithDropdownFutureSpot(indexGap);
    });

    async function compareIndexGapWithDropdownFutureSpot(indexGap) {
        const selectedIndex = parseFloat($("#indexDropdown2").val());
        if (selectedIndex !== undefined) {
            if (parseFloat(indexGap) < selectedIndex) {
                $("#indexGap2").css("color", "#00FF7F");
            } else if (parseFloat(indexGap) > selectedIndex) {
                $("#indexGap2").css("color", "red");
            } else {
                $("#indexGap2").css("color", "yellow");
            }
        }
    }

    async function calcIndexGapFutureSpot(spotPrice, futurePrice) {
        try {
            let adjustedSpotPrice = spotPrice * 1.001;  // Spot sell (receive less)
            let adjustedFuturePrice = futurePrice * 0.9995; // Future buy (pay more)
            return parseFloat(((adjustedSpotPrice - adjustedFuturePrice) / adjustedFuturePrice) * 100).toFixed(5);
        } catch (error) {
            console.error('Error at calcIndexGapFutureSpot():', error);
            return "0.000";
        }
    }

    $(".refreshPrice").on("click", async function () {
        console.log("Refreshing Prices...");
        await fetchPrices();
        console.log("Prices Refreshed!");
    });

    function updateUtcNowTime() {
        const currentUtc = new Date().toISOString().substring(0, 19).replace("T", " ");
        $("#utcnow").text(currentUtc);
    }

    function updateUtcLastTime() {
        const currentUtc = new Date().toISOString().substring(0, 19).replace("T", " ");
        $("#utclast").text(currentUtc);
    }

    populateIndexDropdownSpotFuture();
    populateIndexDropdownFutureSpot();
    fetchPrices();

    setInterval(fetchPrices, 7000);
    setInterval(updateUtcNowTime, 1000);
});