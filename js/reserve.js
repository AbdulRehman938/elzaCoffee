function initReserve() {
    const form = document.getElementById('reservation-form');
    if (!form) return;

    const guestSelect = document.getElementById('guest-select');
    const guestOptions = document.getElementById('guest-options');
    const guestValue = guestSelect.querySelector('.selected-value');

    const dateInput = document.getElementById('reserve-date');
    const datePicker = document.getElementById('date-picker-ui');
    
    const timeInput = document.getElementById('reserve-time');
    const timePicker = document.getElementById('time-picker-ui');

    let currentViewDate = new Date();

    // --- 1. Guest Dropdown ---
    guestSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns([guestOptions]);
        guestOptions.classList.toggle('open');
    });

    guestOptions.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            guestValue.textContent = option.textContent;
            guestValue.classList.add('active');
            guestOptions.classList.remove('open');
        });
    });

    // --- 2. Custom Calendar with Nav ---
    dateInput.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns([datePicker]);
        renderCalendar(currentViewDate);
        datePicker.classList.toggle('open');
    });

    function renderCalendar(viewDate) {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Adjust for Monday start (0=Su -> 6=Sa to 0=Mo -> 6=Su)
        const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        let html = `
            <div class="calendar-header">
                <span>${viewDate.toLocaleString('default', { month: 'long' })} ${year}</span>
                <div class="calendar-nav">
                    <button type="button" id="prev-month">❮</button>
                    <button type="button" id="next-month">❯</button>
                </div>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-head">Mo</div>
                <div class="calendar-day-head">Tu</div>
                <div class="calendar-day-head">We</div>
                <div class="calendar-day-head">Th</div>
                <div class="calendar-day-head">Fr</div>
                <div class="calendar-day-head">Sa</div>
                <div class="calendar-day-head">Su</div>
        `;

        // Empty slots for start offset
        for (let j = 0; j < startOffset; j++) {
            html += `<div class="calendar-day empty"></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            html += `<div class="calendar-day" data-day="${i}">${i}</div>`;
        }
        
        html += `</div>`;
        datePicker.innerHTML = html;

        // Nav events
        datePicker.querySelector('#prev-month').addEventListener('click', (e) => {
            e.stopPropagation();
            currentViewDate.setMonth(currentViewDate.getMonth() - 1);
            renderCalendar(currentViewDate);
        });

        datePicker.querySelector('#next-month').addEventListener('click', (e) => {
            e.stopPropagation();
            currentViewDate.setMonth(currentViewDate.getMonth() + 1);
            renderCalendar(currentViewDate);
        });

        // Day clicks
        datePicker.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
            day.addEventListener('click', () => {
                dateInput.value = `${day.dataset.day} ${viewDate.toLocaleString('default', { month: 'short' })}, ${year}`;
                datePicker.classList.remove('open');
            });
        });
    }

    // --- 3. Professional Time Picker ---
    timeInput.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns([timePicker]);
        renderTimePicker();
        timePicker.classList.toggle('open');
    });

    function renderTimePicker() {
        const times = [
            "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
            "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
            "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
            "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"
        ];
        
        let html = '<div class="time-list">';
        times.forEach(t => {
            html += `<div class="time-item">${t}</div>`;
        });
        html += '</div>';
        timePicker.innerHTML = html;

        timePicker.querySelectorAll('.time-item').forEach(item => {
            item.addEventListener('click', () => {
                timeInput.value = item.textContent;
                timePicker.classList.remove('open');
            });
        });
    }

    // --- Helpers ---
    function closeAllDropdowns(except = []) {
        const all = [guestOptions, datePicker, timePicker];
        all.forEach(d => {
            if (!except.includes(d)) d.classList.remove('open');
        });
    }

    document.addEventListener('click', () => closeAllDropdowns());

    // --- 4. Validation & Submit ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        const inputs = form.querySelectorAll('.form-group[data-validate]');
        
        inputs.forEach(group => {
            const input = group.querySelector('input');
            const validateMsg = group.getAttribute('data-validate');
            
            group.classList.remove('error');
            const oldMsg = group.querySelector('.error-message');
            if (oldMsg) oldMsg.remove();

            if (!input.value.trim() || (input.type === 'email' && !validateEmail(input.value))) {
                isValid = false;
                group.classList.add('error');
                const msg = document.createElement('span');
                msg.className = 'error-message';
                msg.textContent = validateMsg;
                group.appendChild(msg);
            }
        });

        if (isValid) {
            const btn = document.getElementById('reserve-btn');
            const originalText = btn.textContent;
            btn.textContent = "Confirmed!";
            btn.style.background = "#4CAF50";
            form.reset();
            guestValue.textContent = "Guest";
            guestValue.classList.remove('active');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = "";
            }, 3000);
        }
    });

    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
}

window.initReserve = initReserve;
