// teams stuff - create, join, leave, view

// show all teams the user is in
async function renderTeams() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user:', user);
    if (!user.id) {
      console.error('User not logged in');
      const teamsList = document.getElementById('teamsList');
      if (teamsList) {
        teamsList.innerHTML = '<p style="color: #ef4444; padding: 20px;">You must be logged in to view teams.</p>';
      }
      return;
    }

    console.log('Fetching teams for user ID:', user.id);
    const teams = await teamsAPI.getUserTeams(user.id);
    console.log('Teams received:', teams);
    const teamsList = document.getElementById('teamsList');
    
    if (!teamsList) return;
    
    teamsList.innerHTML = '';
    
    if (teams.length === 0) {
      teamsList.innerHTML = '<p style="color: #6b7280; padding: 20px;">You are not part of any teams yet. Create one to get started!</p>';
      return;
    }
    
    for (const team of teams) {
      const teamCard = document.createElement('div');
      teamCard.className = 'team-card';
      teamCard.style.cssText = 'border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;';
      
      // get list of team members
      let members = [];
      try {
        members = await teamsAPI.getMembers(team.id);
      } catch (error) {
        console.error('Failed to load team members:', error);
      }
      
      teamCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; color: #111827;">${team.name}</h3>
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">${team.description || 'No description'}</p>
            <div style="display: flex; gap: 16px; font-size: 13px; color: #6b7280; align-items: center; flex-wrap: wrap;">
              <span>${members.length} member${members.length !== 1 ? 's' : ''}</span>
              <span style="padding: 2px 8px; background: ${team.role === 'admin' ? '#fef3c7' : '#f3f4f6'}; border-radius: 4px; font-size: 11px;">${team.role === 'admin' ? 'Admin' : 'Member'}</span>
              ${team.team_code ? `<span style="font-family: monospace; font-weight: bold; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 4px;">Code: ${team.team_code}</span>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="view-team-btn" data-team-id="${team.id}" style="padding: 6px 12px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">View</button>
            <button class="leave-team-btn" data-team-id="${team.id}" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Leave</button>
          </div>
        </div>
        <div class="team-members-preview" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Members:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${members.slice(0, 5).map(m => `
              <span style="padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 11px;">
                ${m.name}${m.role === 'admin' ? ' (Admin)' : ''}
              </span>
            `).join('')}
            ${members.length > 5 ? `<span style="font-size: 11px; color: #6b7280;">+${members.length - 5} more</span>` : ''}
          </div>
        </div>
      `;
      
      teamsList.appendChild(teamCard);
    }
    
    // handle view button clicks
    document.querySelectorAll('.view-team-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const teamId = parseInt(btn.getAttribute('data-team-id'));
        showTeamDetails(teamId);
      });
    });
    
    // handle leave button clicks
    document.querySelectorAll('.leave-team-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const teamId = parseInt(btn.getAttribute('data-team-id'));
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.id) {
          alert('You must be logged in to leave a team');
          return;
        }
        
        if (confirm('Are you sure you want to leave this team? You will lose access to all team tasks.')) {
          try {
            await teamsAPI.leave(teamId, user.id);
            alert('Successfully left the team');
            renderTeams();
          } catch (error) {
            console.error('Failed to leave team:', error);
            const errorMessage = error.message || 'Unknown error';
            alert(`Failed to leave team: ${errorMessage}`);
          }
        }
      });
    });
  } catch (error) {
    console.error('Failed to render teams:', error);
    const teamsList = document.getElementById('teamsList');
    if (teamsList) {
      const errorMessage = error.message || 'Unknown error';
      teamsList.innerHTML = `<p style="color: #ef4444; padding: 20px;">Failed to load teams: ${errorMessage}<br><small>Check console for details. Make sure the database tables exist.</small></p>`;
    }
  }
}

// open create team modal
function showTeamModal() {
  const modal = document.getElementById('teamModal');
  if (modal) {
    modal.style.display = 'flex';
    const form = document.getElementById('teamForm');
    if (form) {
      form.reset();
    }
  }
}

// close create team modal
function closeTeamModal() {
  const modal = document.getElementById('teamModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// show team info and members
async function showTeamDetails(teamId) {
  try {
    const team = await teamsAPI.getById(teamId);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const modal = document.getElementById('teamDetailsModal');
    const title = document.getElementById('teamDetailsTitle');
    const content = document.getElementById('teamDetailsContent');
    const membersList = document.getElementById('teamMembersList');
    
    if (!modal || !title || !content || !membersList) return;
    
    title.textContent = team.name;
    
    // check if logged in user is in this team
    const currentUserMember = team.members.find(m => m.user_id === user.id);
    const canLeave = currentUserMember !== undefined;
    
    membersList.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 12px 0;">Description</h3>
        <p style="color: #6b7280;">${team.description || 'No description'}</p>
      </div>
      ${team.team_code ? `
      <div style="margin-bottom: 16px; padding: 12px; background: #f3f4f6; border-radius: 6px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Team Code</h3>
        <div style="display: flex; align-items: center; gap: 8px;">
          <code style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #6366f1; background: white; padding: 8px 16px; border-radius: 4px; border: 2px solid #6366f1;">${team.team_code}</code>
          <button class="copy-team-code-btn" data-code="${team.team_code}" style="padding: 8px 12px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Share this code with others to let them join your team</p>
      </div>
      ` : ''}
      <div>
        <h3 style="margin: 0 0 12px 0;">Team Members (${team.members.length})</h3>
        <div class="members-list">
          ${team.members.map(member => `
            <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 500;">${member.name}</div>
                <div style="font-size: 12px; color: #6b7280;">${member.email} • ID: ${member.student_id || 'N/A'}</div>
              </div>
              <span style="padding: 4px 8px; background: ${member.role === 'admin' ? '#fef3c7' : '#f3f4f6'}; border-radius: 4px; font-size: 11px;">
                ${member.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
      ${canLeave ? `
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <button class="leave-team-details-btn" data-team-id="${teamId}" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; width: 100%;">Leave Team</button>
      </div>
      ` : ''}
    `;
    
    // handle copy team code button
    document.querySelectorAll('.copy-team-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        navigator.clipboard.writeText(code).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.background = '#10b981';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#6366f1';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy:', err);
          alert('Failed to copy code. Code: ' + code);
        });
      });
    });
    
    // handle leave team button
    document.querySelectorAll('.leave-team-details-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const teamId = parseInt(btn.getAttribute('data-team-id'));
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.id) {
          alert('You must be logged in to leave a team');
          return;
        }
        
        if (confirm('Are you sure you want to leave this team? You will lose access to all team tasks.')) {
          try {
            const result = await teamsAPI.leave(teamId, user.id);
            if (result.teamDeleted) {
              alert('You left the team. The team was deleted as you were the only member.');
            } else {
              alert('Successfully left the team');
            }
            closeTeamDetailsModal();
            renderTeams();
          } catch (error) {
            console.error('Failed to leave team:', error);
            const errorMessage = error.message || 'Unknown error';
            alert(`Failed to leave team: ${errorMessage}`);
          }
        }
      });
    });
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Failed to load team details:', error);
    alert('Failed to load team details. Please try again.');
  }
}

// close team details popup
function closeTeamDetailsModal() {
  const modal = document.getElementById('teamDetailsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// open join team modal
function showJoinTeamModal() {
  const modal = document.getElementById('joinTeamModal');
  if (modal) {
    modal.style.display = 'flex';
    const form = document.getElementById('joinTeamForm');
    if (form) {
      form.reset();
      const codeInput = document.getElementById('teamCode');
      if (codeInput) {
        codeInput.focus();
      }
    }
  }
}

// close join team modal
function closeJoinTeamModal() {
  const modal = document.getElementById('joinTeamModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// setup all the team stuff when page loads
document.addEventListener('DOMContentLoaded', () => {
  const createTeamBtn = document.getElementById('createTeamBtn');
  const joinTeamBtn = document.getElementById('joinTeamBtn');
  const teamForm = document.getElementById('teamForm');
  const joinTeamForm = document.getElementById('joinTeamForm');
  const closeTeamModalBtn = document.querySelector('.close-team-modal');
  const cancelTeamBtn = document.querySelector('.btn-cancel-team');
  const closeJoinTeamModalBtn = document.querySelector('.close-join-team-modal');
  const cancelJoinTeamBtn = document.querySelector('.btn-cancel-join-team');
  const closeTeamDetailsBtn = document.querySelector('.close-team-details-modal');
  
  if (createTeamBtn) {
    createTeamBtn.addEventListener('click', showTeamModal);
  }
  
  if (joinTeamBtn) {
    joinTeamBtn.addEventListener('click', showJoinTeamModal);
  }
  
  if (closeTeamModalBtn) {
    closeTeamModalBtn.addEventListener('click', closeTeamModal);
  }
  
  if (cancelTeamBtn) {
    cancelTeamBtn.addEventListener('click', closeTeamModal);
  }
  
  if (closeJoinTeamModalBtn) {
    closeJoinTeamModalBtn.addEventListener('click', closeJoinTeamModal);
  }
  
  if (cancelJoinTeamBtn) {
    cancelJoinTeamBtn.addEventListener('click', closeJoinTeamModal);
  }
  
  if (closeTeamDetailsBtn) {
    closeTeamDetailsBtn.addEventListener('click', closeTeamDetailsModal);
  }
  
  // make team code uppercase automatically
  const teamCodeInput = document.getElementById('teamCode');
  if (teamCodeInput) {
    teamCodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
  }
  
  // when user submits join team form
  if (joinTeamForm) {
    joinTeamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        alert('You must be logged in to join a team');
        return;
      }
      
      const teamCode = document.getElementById('teamCode').value.trim().toUpperCase();
      
      if (!teamCode || teamCode.length !== 6) {
        alert('Please enter a valid 6-character team code');
        return;
      }
      
      try {
        await teamsAPI.joinByCode(teamCode, user.id);
        alert('Successfully joined the team!');
        closeJoinTeamModal();
        renderTeams();
      } catch (error) {
        console.error('Failed to join team:', error);
        const errorMessage = error.message || 'Unknown error';
        alert(`Failed to join team: ${errorMessage}`);
      }
    });
  }
  
  // close modals if clicking outside
  window.addEventListener('click', (e) => {
    const teamModal = document.getElementById('teamModal');
    const teamDetailsModal = document.getElementById('teamDetailsModal');
    const joinTeamModal = document.getElementById('joinTeamModal');
    if (e.target === teamModal) {
      closeTeamModal();
    }
    if (e.target === teamDetailsModal) {
      closeTeamDetailsModal();
    }
    if (e.target === joinTeamModal) {
      closeJoinTeamModal();
    }
  });
  
  if (teamForm) {
    teamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        alert('You must be logged in to create a team');
        return;
      }
      
      const name = document.getElementById('teamName').value.trim();
      const description = document.getElementById('teamDescription').value.trim();
      
      if (!name) {
        alert('Please enter a team name');
        return;
      }
      
      try {
        await teamsAPI.create({ name, description, creator_id: user.id });
        closeTeamModal();
        renderTeams();
      } catch (error) {
        console.error('Failed to create team:', error);
        const errorMessage = error.message || 'Unknown error';
        alert(`Failed to create team: ${errorMessage}\n\nMake sure the teams and team_members tables exist in your database.`);
      }
    });
  }
});

// make these available to other files
window.renderTeams = renderTeams;
window.showTeamDetails = showTeamDetails;

