function doGet() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');

    // Assume Row 1 is Headers: ID, Name, Score
    // Data starts from Row 2
    // We read columns A, B, C (1, 2, 3)

    // Get all data range
    var lastRow = sheet.getLastRow();

    // If no data (only header or nothing), return empty
    if (lastRow < 2) {
        return ContentService.createTextOutput(JSON.stringify([]))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var range = sheet.getRange(2, 1, lastRow - 1, 3);
    var values = range.getValues();

    var data = [];

    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        // Simple check to ensure we don't have empty rows
        if (row[1] !== "") {
            data.push({
                id: row[0],
                name: row[1],
                score: row[2]
            });
        }
    }

    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// How to deploy:
// 1. Extensions > Apps Script
// 2. Paste this code.
// 3. Deploy > New Deployment
// 4. Select "Web app"
// 5. Execute as: "Me"
// 6. Who has access: "Anyone" <- IMPORTANT
// 7. Click Deploy, Copy the URL.
