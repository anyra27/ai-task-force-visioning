/**
 * Vibe Coding Workshop - Google Apps Script Backend
 *
 * Serves three workshop modules (Intro, Intermediate, Advanced).
 * Handles three submission types per module: poll, project, feedback.
 * All modules share the same sheet tabs, distinguished by ModuleId column.
 *
 * Returns data in the same shape the frontend expects
 * (matching the original Firestore document structure).
 */

/**
 * Handle GET requests - retrieve submissions from sheets
 */
function doGet(e) {
  try {
    var action = e.parameter.action || 'getData';
    var type = e.parameter.type || '';
    var moduleId = e.parameter.moduleId || '';

    if (action === 'getData' && type) {
      var data = getSubmissions(type, moduleId);
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: data })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Missing type parameter' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests - submit data to sheets
 */
function doPost(e) {
  try {
    var payload;

    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    } else {
      throw new Error('No data received');
    }

    var type = payload.type;
    if (!type) throw new Error('Missing submission type');

    var result = saveSubmission(payload);

    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// SHEET TAB MAPPING
// =========================================================================

var SHEET_TABS = {
  poll: 'Polls',
  project: 'Projects',
  feedback: 'Feedback'
};

var SHEET_HEADERS = {
  poll: ['Timestamp', 'ModuleId', 'UserId', 'UserName', 'UserEmail', 'TediousTask'],
  project: ['Timestamp', 'ModuleId', 'UserId', 'UserName', 'UserEmail', 'Area', 'Title', 'Description', 'Link', 'Members'],
  feedback: ['Timestamp', 'ModuleId', 'UserId', 'UserName', 'UserEmail', 'WhatSurprised', 'ConfidenceNow', 'TeacherTraining', 'WhatNext', 'MoreTrainings', 'SessionRating', 'Comments']
};

// =========================================================================
// SAVE
// =========================================================================

function saveSubmission(payload) {
  var type = payload.type;
  var tabName = SHEET_TABS[type];
  if (!tabName) throw new Error('Unknown submission type: ' + type);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(SHEET_HEADERS[type]);
  }

  var data = payload.data || {};
  var moduleId = payload.moduleId || '';
  var row;

  if (type === 'poll') {
    row = [
      new Date(),
      moduleId,
      payload.userId || '',
      payload.userName || 'Anonymous',
      payload.userEmail || '',
      data.tediousTask || ''
    ];
  } else if (type === 'project') {
    row = [
      new Date(),
      moduleId,
      payload.userId || '',
      payload.userName || 'Anonymous',
      payload.userEmail || '',
      data.area || '',
      data.title || '',
      data.description || '',
      data.link || '',
      data.members || ''
    ];
  } else if (type === 'feedback') {
    row = [
      new Date(),
      moduleId,
      payload.userId || '',
      payload.userName || 'Anonymous',
      payload.userEmail || '',
      data.whatSurprised || '',
      data.confidenceNow || 0,
      data.teacherTraining || 0,
      data.whatNext || '',
      data.moreTrainings || '',
      data.sessionRating || 0,
      data.comments || ''
    ];
  }

  sheet.appendRow(row);

  return {
    success: true,
    message: type + ' submitted successfully',
    timestamp: new Date().toISOString()
  };
}

// =========================================================================
// READ
// =========================================================================

/**
 * Get submissions from a sheet tab, optionally filtered by moduleId.
 * Returns data in the Firestore document shape the frontend expects.
 */
function getSubmissions(type, moduleId) {
  var tabName = SHEET_TABS[type];
  if (!tabName) return [];

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var rawData = sheet.getDataRange().getValues();
  var result = [];

  // Column indices (with ModuleId at index 1)
  var COL_TIMESTAMP = 0;
  var COL_MODULE = 1;
  var COL_USERID = 2;
  var COL_USERNAME = 3;
  var COL_USEREMAIL = 4;
  var COL_DATA_START = 5;

  for (var i = rawData.length - 1; i >= 1; i--) {
    var row = rawData[i];

    // Filter by moduleId if provided
    if (moduleId && row[COL_MODULE] !== moduleId) continue;

    var doc = {
      id: 'row_' + i,
      moduleId: row[COL_MODULE] || '',
      userName: row[COL_USERNAME] || 'Anonymous',
      userId: row[COL_USERID] || '',
      userEmail: row[COL_USEREMAIL] || '',
      createdAt: row[COL_TIMESTAMP] ? new Date(row[COL_TIMESTAMP]).toISOString() : '',
      data: {}
    };

    if (type === 'poll') {
      doc.data = { tediousTask: row[COL_DATA_START] || '' };
    } else if (type === 'project') {
      doc.data = {
        area: row[COL_DATA_START] || '',
        title: row[COL_DATA_START + 1] || '',
        description: row[COL_DATA_START + 2] || '',
        link: row[COL_DATA_START + 3] || '',
        members: row[COL_DATA_START + 4] || ''
      };
    } else if (type === 'feedback') {
      doc.data = {
        whatSurprised: row[COL_DATA_START] || '',
        confidenceNow: row[COL_DATA_START + 1] || 0,
        teacherTraining: row[COL_DATA_START + 2] || 0,
        whatNext: row[COL_DATA_START + 3] || '',
        moreTrainings: row[COL_DATA_START + 4] || '',
        sessionRating: row[COL_DATA_START + 5] || 0,
        comments: row[COL_DATA_START + 6] || ''
      };
    }

    result.push(doc);
  }

  return result;
}
