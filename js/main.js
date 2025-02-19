const lowestGap = -1.000; // Store as a number instead of a string

// Create an array of available indexes
const indexList = [-3.000, -2.000, -1.500, -1.000, -0.500, -0.100, 0.000, 0.500, 1.000]; // Example values, you can add more

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

            // Compare with selected index from dropdown
            await compareIndexGapWithDropdown(indexGap);

            // Update the UTC time
            updateUtcLastTime();
        } catch (error) {
            $("#spotPrice").text('Error fetching data');
            $("#futurePrice").text('Error fetching data');
            $("#indexGap").text('Error calculating gap').css("color", "white");
            console.error('Error at fetchPrices():', error);
        }
    }

    // Populate the dropdown with index values
    function populateIndexDropdown() {
        const dropdown = $("#indexDropdown");
        indexList.forEach(index => {
            const option = $("<option>").text(index).val(index);
            dropdown.append(option);
        });

        // Set default value from localStorage or fallback to -1.000
        const savedIndex = localStorage.getItem('selectedIndex');
        if (savedIndex) {
            dropdown.val(savedIndex);
        } else {
            dropdown.val(-1.000); // Default to -1.000
        }
    }

    // Save the selected index in localStorage
    $("#indexDropdown").on("change", function() {
        const selectedIndex = $(this).val();
        localStorage.setItem('selectedIndex', selectedIndex);
        
        const indexGap = $("#indexGap").text().replace('%', ''); // Get the current Index Gap without '%'
        compareIndexGapWithDropdown(indexGap);
    });

    // Compare Index Gap with the selected dropdown value
    async function compareIndexGapWithDropdown(indexGap) {
        const selectedIndex = parseFloat($("#indexDropdown").val());
        if (selectedIndex !== undefined) {
            if (parseFloat(indexGap) < selectedIndex) {
                $("#indexGap").css("color", "#00FF7F");
            } else if (parseFloat(indexGap) > selectedIndex) {
                $("#indexGap").css("color", "red");
            } else {
                $("#indexGap").css("color", "yellow");
            }
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
            return parseFloat((((futurePrice - spotPrice) / spotPrice)) * 100).toFixed(5);
        } catch (error) {
            console.error('Error at calcIndexGap():', error);
            return "0.000";
        }
    }

    // Update UTC time and store the last value
    function updateUtcNowTime() {
        const currentUtc = new Date().toISOString().substring(0, 19).replace("T", " ");
        $("#utcnow").text(currentUtc);
    }

    // Update UTC time and store the last value
    function updateUtcLastTime() {
        const currentUtc = new Date().toISOString().substring(0, 19).replace("T", " ");
        $("#utclast").text(currentUtc);
    }

    // Initial fetch and populate dropdown
    populateIndexDropdown();
    fetchPrices();

    // Auto-refresh prices every 7 seconds
    setInterval(fetchPrices, 7000);

    // Update UTC time every second
    setInterval(updateUtcNowTime, 1000);
});