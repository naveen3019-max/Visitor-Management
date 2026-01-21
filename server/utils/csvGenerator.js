const { stringify } = require('csv-stringify/sync');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const generateVisitorCSV = (visitors, filename = 'visitor-report.csv') => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(reportsDir, filename);

      // Prepare data
      const records = visitors.map(visitor => ({
        Name: visitor.name || '',
        Contact: visitor.contact || '',
        'Member ID': visitor.memberId || '',
        Purpose: visitor.purpose || '',
        Department: visitor.department?.name || '',
        'Person to Meet': visitor.personToMeet || '',
        Status: visitor.status || '',
        'Time In': visitor.timeIn ? new Date(visitor.timeIn).toLocaleString() : '',
        'Time Out': visitor.timeOut ? new Date(visitor.timeOut).toLocaleString() : '',
        'Logged By': visitor.guardId?.fullName || visitor.guardId?.username || ''
      }));

      // Generate CSV
      const csv = stringify(records, {
        header: true,
        columns: [
          'Name',
          'Contact',
          'Member ID',
          'Purpose',
          'Department',
          'Person to Meet',
          'Status',
          'Time In',
          'Time Out',
          'Logged By'
        ]
      });

      // Write to file
      fs.writeFileSync(filePath, csv);

      resolve(filePath);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateVisitorCSV };
