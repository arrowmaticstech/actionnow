document.addEventListener('DOMContentLoaded', () => {
    const fetchGroupsBtn = document.getElementById('fetchGroupsBtn');
    const closeDropdownBtn = document.getElementById('closeDropdownBtn');
    
    if (closeDropdownBtn) {
        closeDropdownBtn.addEventListener('click', () => {
            const fetchedDropdown = document.getElementById('fetchedDropdown');
            if (fetchedDropdown) {
                fetchedDropdown.classList.add('hidden');
            }
        });
    }

    if (fetchGroupsBtn) {
        fetchGroupsBtn.addEventListener('click', async () => {
            const phoneNumber = document.getElementById('waPhoneNumber').value.trim();
            if (!phoneNumber) {
                alert('Please enter a WhatsApp number first.');
                return;
            }

            const originalText = fetchGroupsBtn.innerHTML;
            fetchGroupsBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Fetching...';
            fetchGroupsBtn.disabled = true;

            try {
                const response = await fetch('https://arrowmatics.app.n8n.cloud/webhook/get-whatsapp-group-list', {
                    method: 'POST',
                    body: new URLSearchParams({ phonenumber: phoneNumber })
                });

                if (response.ok) {
                    const data = await response.json();
                    const fetchedDropdown = document.getElementById('fetchedDropdown');
                    const fetchedDropdownList = document.getElementById('fetchedDropdownList');
                    fetchedDropdownList.innerHTML = ''; // Clear existing
                    
                    let groups = [];
                    // Handle the specific response format: [ { "success": true, "data": [ ... ] } ]
                    if (Array.isArray(data) && data.length > 0 && data[0].success !== undefined && data[0].data) {
                        groups = data[0].data;
                    } else if (data && data.success !== undefined && data.data) {
                        groups = data.data;
                    } else {
                        groups = Array.isArray(data) ? data : (data.groups || []);
                    }

                    if (groups.length === 0) {
                        fetchedDropdownList.innerHTML = '<p class="text-sm text-gray-500 p-2">No groups found.</p>';
                    } else {
                        groups.forEach(group => {
                            const name = typeof group === 'object' ? (group.name || group.id) : group;
                            // Skip empty names
                            if (!name) return;
                            
                            const div = document.createElement('div');
                            div.className = 'flex items-center gap-2 px-3 py-2 hover:bg-wa-gray rounded cursor-pointer transition-colors';
                            div.innerHTML = `
                                <i data-lucide="plus" class="w-4 h-4 text-gray-400"></i>
                                <span class="text-sm text-gray-700 flex-1 truncate">${name}</span>
                            `;
                            div.addEventListener('click', () => {
                                const groupList = document.getElementById('groupList');
                                
                                // Check if group already exists
                                const existingGroups = Array.from(groupList.querySelectorAll('.truncate')).map(el => el.textContent.trim());
                                if (existingGroups.includes(name)) {
                                    return; // Ignore if already in the list
                                }
                                
                                const item = document.createElement('div');
                                item.className = 'flex items-center gap-2 bg-wa-gray rounded-lg px-3 py-2.5';
                                item.innerHTML = `
                                    <span class="text-sm text-gray-600 flex-1 truncate">${name}</span>
                                    <span class="text-xs text-wa-green font-medium bg-wa-light px-2 py-0.5 rounded-full">Active</span>
                                    <button class="text-gray-400 hover:text-red-500 transition-colors p-1 remove-group"><i data-lucide="x" class="w-4 h-4"></i></button>
                                `;
                                
                                // Add remove functionality to the 'x' button
                                const removeBtn = item.querySelector('.remove-group');
                                if (removeBtn) {
                                    removeBtn.addEventListener('click', () => {
                                        item.remove();
                                    });
                                }
                                
                                groupList.appendChild(item);
                                if (typeof lucide !== 'undefined') lucide.createIcons();
                            });
                            fetchedDropdownList.appendChild(div);
                        });
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }
                    
                    fetchedDropdown.classList.remove('hidden');
                } else {
                    alert('Failed to fetch groups. Please try again.');
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
                alert('An error occurred while fetching groups.');
            } finally {
                fetchGroupsBtn.innerHTML = originalText;
                fetchGroupsBtn.disabled = false;
            }
        });
    }

    const saveBtn = document.getElementById('saveConfigBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            // Collect the data from the UI

            // 1. Get Groups
            const groupEls = document.querySelectorAll('#groupList .truncate');
            const groups = Array.from(groupEls).map(el => el.textContent.trim());

            // 2. Get Interval & Start Time
            const interval = document.getElementById('intervalSelect')?.value || '15';
            const startTime = document.getElementById('startTimeInput')?.value || '';

            // 3. Get Boss Numbers
            const bossNumberEls = document.querySelectorAll('.boss-number-input');
            const bossNumbers = Array.from(bossNumberEls).map(el => el.value.trim()).filter(v => v !== '');

            // 4. Get Keywords
            const keywordEls = document.querySelectorAll('#keywordTags span');
            const keywords = Array.from(keywordEls).map(el => {
                const clone = el.cloneNode(true);
                const btn = clone.querySelector('button');
                if (btn) btn.remove();
                return clone.textContent.trim();
            }).filter(k => k.length > 0);

            // 5. Get Content Types
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            const contentTypes = {
                text: checkboxes[0] ? checkboxes[0].checked : true,
                audio: checkboxes[1] ? checkboxes[1].checked : true,
                images: checkboxes[2] ? checkboxes[2].checked : true,
                documents: checkboxes[3] ? checkboxes[3].checked : false
            };

            const payload = {
                groups,
                startTime,
                interval,
                bossNumbers,
                keywords,
                contentTypes
            };

            console.log('Sending data to API:', payload);

            try {
                // Simulating an API call
                // In a real scenario, this would be a real endpoint like 'https://api.actionnow.com/config'
                const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Successfully saved to API!', data);
                    // main.js handles the toast UI
                } else {
                    console.error('Failed to save to API');
                }
            } catch (error) {
                console.error('Error sending data to API:', error);
            }
        });
    }
});
