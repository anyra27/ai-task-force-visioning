/**
 * Populate headers for all submission tabs.
 * Run this function once after creating the Google Sheet.
 */
function populateHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var tabs = {
    'Polls': ['Timestamp', 'ModuleId', 'UserId', 'UserName', 'UserEmail', 'TediousTask'],
    'Projects': ['Timestamp', 'ModuleId', 'UserId', 'UserName', 'UserEmail', 'Area', 'Title', 'Description', 'Link', 'Members'],
    'Feedback': ['Timestamp', 'ModuleId', 'UserId', 'UserName', 'UserEmail', 'WhatSurprised', 'ConfidenceNow', 'TeacherTraining', 'WhatNext', 'MoreTrainings', 'SessionRating', 'Comments']
  };

  for (var tabName in tabs) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }

    var headers = tabs[tabName];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4a5568');
    headerRange.setFontColor('#ffffff');

    sheet.setFrozenRows(1);

    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  Logger.log('All headers populated successfully!');
}

/**
 * Clear all responses from all tabs (keeps headers)
 */
function clearAllResponses() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Clear All Responses',
    'This will delete all submission data from Polls, Projects, and Feedback tabs. Are you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var tabNames = ['Polls', 'Projects', 'Feedback'];

    tabNames.forEach(function(tabName) {
      var sheet = ss.getSheetByName(tabName);
      if (sheet && sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
        Logger.log(tabName + ' cleared!');
      }
    });
  }
}

/**
 * Test the setup by logging sheet info
 */
function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Spreadsheet Name: ' + ss.getName());
  Logger.log('Spreadsheet ID: ' + ss.getId());

  var sheets = ss.getSheets();
  Logger.log('Sheets:');
  sheets.forEach(function(sheet) {
    Logger.log('  - ' + sheet.getName() + ' (' + sheet.getLastRow() + ' rows)');
  });
}
