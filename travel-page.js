(function () {
    const data = window.travelPageData;
    if (!data) return;

    const categoryIcons = {
        food: '🍜',
        spot: '📍',
        move: '🚃',
        shop: '🛍️',
        hotel: '🏨'
    };

    const root = document.getElementById('itinerary-root');
    const checkRoot = document.getElementById('checklist-root');
    const modal = document.getElementById('modal');

    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function nl(value) {
        return esc(value).replace(/\n/g, '<br>');
    }

    function eventIcon(ev) {
        if (ev.flight || /飛|航班|搭機|機場|出發|回程/.test(`${ev.title || ''}${ev.desc || ''}`)) return '✈️';
        return categoryIcons[ev.type] || '📍';
    }

    function classForType(type) {
        if (type === 'food') return 'c-food';
        if (type === 'move') return 'c-move';
        if (type === 'shop') return 'c-shop';
        if (type === 'hotel') return 'c-hotel';
        return 'c-spot';
    }

    function summaryFor(day) {
        if (day.summary) return day.summary;
        const titles = (day.events || []).slice(0, 4).map((ev) => ev.title).filter(Boolean);
        return titles.length ? `主要安排：${titles.join('、')}。` : '今日行程待補。';
    }

    function renderFlights() {
        const flights = data.flights || [];
        if (!flights.length) return;

        const header = document.querySelector('.container header');
        if (!header || document.getElementById('flight-root')) return;

        const section = document.createElement('section');
        section.id = 'flight-root';
        section.className = 'flight-section';
        section.innerHTML = `
            <div class="day-title" style="transform: rotate(1deg);">✈️ 航班資訊</div>
            <div class="flight-grid">
                ${flights.map((flight) => `
                    <article class="flight-card">
                        <div class="flight-card-header">
                            <div class="flight-direction">${esc(flight.direction || '航班')}</div>
                            <div class="flight-no">${esc(flight.flightNo || '航班待補')}</div>
                        </div>
                        <div class="flight-route">
                            <div class="flight-airport">
                                <div class="flight-airport-code">${esc(flight.depart?.airport || '')}</div>
                                <div class="flight-airport-meta">
                                    ${esc(flight.date || '')}<br>
                                    ${esc(flight.depart?.time || '時間待確認')}<br>
                                    ${esc(flight.depart?.terminal || '航廈出發前確認')}
                                </div>
                            </div>
                            <div class="flight-arrow">→</div>
                            <div class="flight-airport">
                                <div class="flight-airport-code">${esc(flight.arrive?.airport || '')}</div>
                                <div class="flight-airport-meta">
                                    ${esc(flight.arrive?.date || flight.date || '')}<br>
                                    ${esc(flight.arrive?.time || '時間待確認')}<br>
                                    ${esc(flight.arrive?.terminal || '航廈出發前確認')}
                                </div>
                            </div>
                        </div>
                        ${flight.note ? `<div class="flight-note">${nl(flight.note)}</div>` : ''}
                    </article>
                `).join('')}
            </div>
        `;
        header.insertAdjacentElement('afterend', section);
    }

    function renderItinerary() {
        if (!root) return;
        root.innerHTML = '';

        (data.days || []).forEach((day, index) => {
            const section = document.createElement('div');
            section.className = 'day-section';

            const header = document.createElement('button');
            header.type = 'button';
            header.className = 'day-title day-toggle';
            header.setAttribute('aria-expanded', 'false');
            header.innerText = `${day.date} @${day.location}`;
            section.appendChild(header);

            const w = day.weather || {};
            const summary = document.createElement('div');
            summary.className = 'day-summary-card';
            summary.innerHTML = `
                <div class="day-summary-top">
                    <div class="day-summary-title">${esc(day.location || `Day ${index + 1}`)}</div>
                    <div class="day-summary-weather">${esc(w.icon || '☁️')} ${esc(w.desc || '')} ${esc(w.high || '')}/${esc(w.low || '')}</div>
                </div>
                <div class="day-summary-text">${nl(summaryFor(day))}</div>
                <div class="day-expand-hint"><span class="hint-icon">＋</span><span>展開完整行程</span></div>
            `;
            section.appendChild(summary);

            const content = document.createElement('div');
            content.className = 'day-content';

            const weatherCard = document.createElement('div');
            weatherCard.className = 'weather-card';
            weatherCard.innerHTML = `
                <div class="weather-top">
                    <div class="w-icon">${esc(w.icon || '☁️')}</div>
                    <div class="w-temp-group">
                        <div class="temp-box"><div class="temp-val t-high">${esc(w.high || '-')}</div><div class="temp-label">High</div></div>
                        <div style="font-size:1.5rem; opacity:0.3;">/</div>
                        <div class="temp-box"><div class="temp-val t-low">${esc(w.low || '-')}</div><div class="temp-label">Low</div></div>
                    </div>
                </div>
                <div class="weather-info">
                    <div class="w-badge">🌡️ 體感 ${esc(w.feel || '-')}</div>
                    <div class="w-badge">☁️ ${esc(w.desc || '-')}</div>
                    <div class="w-badge">🌅 ${esc(w.sun || '-')}</div>
                </div>
            `;
            content.appendChild(weatherCard);

            const timeline = document.createElement('div');
            timeline.className = 'timeline-container';
            (day.events || []).forEach((ev) => {
                const card = document.createElement('div');
                card.className = `timeline-card ${classForType(ev.type)}`;

                let stickersHtml = '<div class="sticker-box">';
                (ev.stickers || []).forEach((s, idx) => {
                    const posClass = `s-pos-${(idx % 3) + 1}`;
                    stickersHtml += `<div class="sticker ${posClass}">${esc(s)}</div>`;
                });
                stickersHtml += '</div>';
                const noteHtml = ev.note ? `<span class="t-note-mini">📝 ${nl(ev.note)}</span>` : '';
                const timeParts = String(ev.time || '--:--').split(':');

                card.innerHTML = `
                    ${stickersHtml}
                    <div class="card-inner">
                        <div class="t-time-group">
                            <span class="t-time-big">${esc(timeParts[0] || '--')}</span>
                            <span class="t-ampm">:${esc(timeParts[1] || '00')}</span>
                        </div>
                        <div class="t-detail">
                            <div class="t-head"><span class="category-icon">${eventIcon(ev)}</span>${esc(ev.title)}</div>
                            <div class="t-desc">${nl(ev.desc)}</div>
                            ${noteHtml}
                        </div>
                    </div>
                `;
                card.onclick = () => openModal(ev);
                timeline.appendChild(card);
            });
            content.appendChild(timeline);
            section.appendChild(content);

            header.addEventListener('click', () => toggleDay(section, header));
            summary.addEventListener('click', () => toggleDay(section, header));
            root.appendChild(section);
        });
    }

    function toggleDay(section, header) {
        const expanded = section.classList.toggle('expanded');
        header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const hint = section.querySelector('.day-expand-hint');
        if (hint) {
            hint.innerHTML = expanded
                ? '<span class="hint-icon">－</span><span>收合這天行程</span>'
                : '<span class="hint-icon">＋</span><span>展開完整行程</span>';
        }
    }

    function renderChecklist() {
        if (!checkRoot || !data.checklist) return;
        checkRoot.innerHTML = '';
        Object.entries(data.checklist).forEach(([category, items]) => {
            const catBox = document.createElement('div');
            catBox.className = 'cl-category';
            const itemsHtml = items.map((item) => {
                const key = `${data.storageKey || 'travel'}_chk_${item}`;
                const isChecked = localStorage.getItem(key) ? 'checked' : '';
                const icon = isChecked ? '✅' : '⬜';
                return `<div class="cl-item ${isChecked}" data-check-key="${esc(key)}">
                    <span class="cl-checkbox">${icon}</span> ${esc(item)}
                </div>`;
            }).join('');
            catBox.innerHTML = `<div class="cl-title">${esc(category)}</div>${itemsHtml}`;
            checkRoot.appendChild(catBox);
        });

        checkRoot.querySelectorAll('.cl-item').forEach((el) => {
            el.addEventListener('click', () => {
                const itemKey = el.dataset.checkKey;
                el.classList.toggle('checked');
                const isChecked = el.classList.contains('checked');
                el.querySelector('.cl-checkbox').innerText = isChecked ? '✅' : '⬜';
                if (isChecked) localStorage.setItem(itemKey, '1');
                else localStorage.removeItem(itemKey);
            });
        });
    }

    function openModal(d) {
        if (!modal) return;
        document.getElementById('m-title').innerText = d.title || '';
        document.getElementById('m-time').innerText = `${d.time || ''} @ ${d.title || ''}`;
        document.getElementById('m-desc').innerText = d.desc || '';
        const noteBox = document.getElementById('m-note-box');
        if (d.note) {
            noteBox.style.display = 'block';
            document.getElementById('m-note').innerText = d.note;
        } else {
            noteBox.style.display = 'none';
        }
        const query = d.mapLink ? d.mapLink : `${d.title || ''} ${data.mapRegion || ''}`;
        document.getElementById('m-map').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        modal.style.display = 'flex';
    }

    window.closeModal = function closeModal() {
        if (modal) modal.style.display = 'none';
    };

    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) window.closeModal();
        };
    }

    renderFlights();
    renderItinerary();
    renderChecklist();
})();
