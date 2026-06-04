document.addEventListener('DOMContentLoaded', () => {
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
