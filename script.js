let result = [];

const fileInput = document.getElementById('csv-file');
const fileName = document.getElementById('file-name');
const convertButton = document.getElementById('convert-button');
const downloadButton = document.getElementById('download-button');
const output = document.getElementById('json-output');
const status = document.getElementById('status');

fileInput.addEventListener('change', function () {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
  }
});

function getProgramName(course) {
  if (course.toUpperCase() === 'BSIT') {
    return 'Bachelor of Science in Information Technology';
  }
  if (course.toUpperCase() === 'BSCS') {
    return 'Bachelor of Science in Computer Science';
  }
  return '';
}

function capitalizeName(name) {
  return name.trim().toLowerCase().replace(/\b\w/g, function (letter) {
    return letter.toUpperCase();
  });
}

function convertCSV(csvText) {
  const lines = csvText.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  const requiredHeaders = [
    'student_id', 'first_name', 'last_name', 'course',
    'year_level', 'email', 'tuition_balance'
  ];

  for (let i = 0; i < requiredHeaders.length; i++) {
    if (!headers.includes(requiredHeaders[i])) {
      throw new Error('Missing column: ' + requiredHeaders[i]);
    }
  }

  const students = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const values = lines[i].split(',');
    const studentId = parseInt(values[0], 10);
    const yearLevel = parseInt(values[4], 10);
    const balance = parseFloat(values[6]);
    const program = getProgramName(values[3]);

    if (isNaN(studentId) || isNaN(yearLevel) || isNaN(balance)) {
      throw new Error('Invalid number on row ' + (i + 1));
    }
    if (program === '') {
      throw new Error('Unknown course on row ' + (i + 1));
    }

    students.push({
      studentId: studentId,
      firstName: capitalizeName(values[1]),
      lastName: capitalizeName(values[2]),
      program: program,
      yearLevel: yearLevel,
      emailAddress: values[5].trim().toLowerCase(),
      outstandingBalance: Number(balance.toFixed(2))
    });
  }

  return students;
}

convertButton.addEventListener('click', function () {
  if (fileInput.files.length === 0) {
    status.textContent = 'Please select a CSV file first.';
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      result = convertCSV(reader.result);
      output.textContent = JSON.stringify(result, null, 2);
      status.textContent = 'CSV converted successfully.';
      downloadButton.disabled = false;
    } catch (error) {
      result = [];
      output.textContent = 'Error: ' + error.message;
      status.textContent = 'The CSV could not be converted.';
      downloadButton.disabled = true;
    }
  };

  reader.readAsText(fileInput.files[0]);
});

downloadButton.addEventListener('click', function () {
  const file = new Blob([JSON.stringify(result, null, 2)], {
    type: 'application/json'
  });
  const link = document.createElement('a');

  link.href = URL.createObjectURL(file);
  link.download = 'transformed_students.json';
  link.click();
  URL.revokeObjectURL(link.href);
});
