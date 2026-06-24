const fs = require('fs');
const content = `    // Clear local storage
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('user_email');
    
    window.dispatchEvent(new Event('authChanged'));
    return true;
  } catch (err) {
    console.error('Failed to delete account:', err);
    return false;
  }
}

export async function createReport(reportData) {
  try {
    const res = await fetch(\`\${API_URL}/reports\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return await res.json();
  } catch (err) {
    console.error('Error submitting report:', err);
    throw err;
  }
}

export async function getReports() {
  try {
    const res = await fetch(\`\${API_URL}/reports\`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch (err) {
    console.error('Error fetching reports:', err);
    return [];
  }
}

export async function updateReportStatus(id, action) {
  try {
    const res = await fetch(\`\${API_URL}/reports/\${id}/action\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return await res.json();
  } catch (err) {
    console.error('Error updating report:', err);
    throw err;
  }
}
`;
fs.appendFileSync('c:/Users/HARDIK/minor/frontend/src/db.js', content);
