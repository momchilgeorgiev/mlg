document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.nbu-dashboard-page');

  if (!root || typeof window.Chart === 'undefined' || typeof window.XLSX === 'undefined') {
    return;
  }

  const fileInput = document.getElementById('dashboard-file-input');
  const demoButton = document.getElementById('load-demo-data');
  const status = document.getElementById('dashboard-status');
  const chartRegistry = {};
  const tabButtons = Array.from(document.querySelectorAll('[data-tab-target]'));
  const tabPanels = Array.from(document.querySelectorAll('[data-tab-panel]'));

  const colors = {
    blue: '#005baa',
    blueSoft: 'rgba(0, 91, 170, 0.16)',
    sky: '#1d84d6',
    skySoft: 'rgba(29, 132, 214, 0.18)',
    cyan: '#42b4e6',
    cyanSoft: 'rgba(66, 180, 230, 0.22)',
    ink: '#17324d',
    slate: '#5e7388',
    border: '#cfe4f4',
    navy: '#00437f'
  };

  const demoWorkbook = {
    salesRows: [
      ['Час', 'Окт', 'Ное', 'Дек', 'Средно', 'Промяна Окт→Дек'],
      ['07:00–08:00', 45, 38, 28, 37, -0.37777777777777777],
      ['08:00–09:00', 62, 51, 35, 49.333333333333336, -0.43548387096774194],
      ['09:00–10:00', 40, 38, 36, 38, -0.1],
      ['10:00–11:00', 35, 34, 33, 34, -0.05714285714285714],
      ['11:00–12:00', 30, 29, 28, 29, -0.06666666666666667],
      ['12:00–13:00', 48, 47, 46, 47, -0.041666666666666664],
      ['13:00–14:00', 52, 50, 49, 50.333333333333336, -0.057692307692307696],
      ['14:00–15:00', 38, 37, 37, 37.333333333333336, -0.02631578947368421],
      ['15:00–16:00', 30, 30, 29, 29.666666666666668, -0.03333333333333333],
      ['16:00–17:00', 25, 25, 24, 24.666666666666668, -0.04],
      ['17:00–18:00', 20, 19, 19, 19.333333333333332, -0.05],
      ['ОБЩО', 425, 398, 364, 395.6666666666667, -0.14352941176470588]
    ],
    reviewRows: [
      ['Дата', 'Оценка (1–5)', 'Категория', 'Коментар'],
      ['2024-10-05', 2, 'Чакане', 'Чаках 15 минути за кафе сутринта'],
      ['2024-10-12', 1, 'Чакане', 'Опашката беше до вратата в 8 часа'],
      ['2024-10-18', 3, 'Чакане', 'Дълго чакане, но кафето е хубаво'],
      ['2024-10-25', 4, 'Качество', 'Страхотно лате, но сутрин е бавно'],
      ['2024-11-02', 2, 'Чакане', 'Пак 10 минути чакане в 7:30'],
      ['2024-11-08', 5, 'Качество', 'Следобедното обслужване е отлично'],
      ['2024-11-15', 1, 'Чакане', 'Само един барист сутринта?! Абсурд'],
      ['2024-11-20', 2, 'Чакане', 'Закъснях за работа заради опашката'],
      ['2024-11-28', 4, 'Атмосфера', 'Уютно е, но сутрин е хаос'],
      ['2024-12-03', 1, 'Чакане', 'Вече не идвам сутрин. Ходя при конкурента'],
      ['2024-12-10', 3, 'Качество', 'Кафето е добро, но не си заслужава чакането'],
      ['2024-12-15', 2, 'Чакане', '12 минути за едно еспресо сутринта'],
      ['2024-12-18', 5, 'Качество', 'След обяд — бързо и вкусно'],
      ['2024-12-22', 1, 'Чакане', 'Спрях да идвам. Жалко.'],
      ['2024-12-28', 4, 'Атмосфера', 'Вечер е прекрасно, сутрин — не']
    ],
    staffRows: [
      ['Час', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'],
      ['07:00–09:00', 1, 1, 1, 1, 1, 1, 0],
      ['09:00–12:00', 2, 2, 2, 2, 2, 2, 1],
      ['12:00–15:00', 2, 2, 2, 2, 2, 2, 1],
      ['15:00–18:00', 1, 1, 1, 1, 2, 1, 0]
    ]
  };

  const setStatus = (message, type = 'default') => {
    status.textContent = message;
    status.dataset.state = type;
  };

  const normalizeText = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

  const findSheetName = (workbook, candidates) => {
    const sheetNames = workbook.SheetNames || [];
    return sheetNames.find((name) => {
      const normalizedName = normalizeText(name);
      return candidates.some((candidate) => normalizedName.includes(candidate));
    });
  };

  const mean = (values) => {
    if (!values.length) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const isWaitingCategory = (value) => normalizeText(value).includes('чак');

  const formatPercent = (value) => `${Math.abs(value * 100).toFixed(1)}%`;
  const formatSignedPercent = (value) => `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
  const formatDecimal = (value) => Number(value).toFixed(1);

  const buildHeaderMap = (headerRow) => {
    const headerMap = {};
    headerRow.forEach((value, index) => {
      headerMap[normalizeText(value)] = index;
    });
    return headerMap;
  };

  const getColumnIndex = (headerMap, options, fallback) => {
    const match = options.find((option) => Object.prototype.hasOwnProperty.call(headerMap, option));
    return typeof match !== 'undefined' ? headerMap[match] : fallback;
  };

  const activateTab = (targetId) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tabTarget === targetId;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    window.requestAnimationFrame(() => {
      Object.values(chartRegistry).forEach((chart) => {
        chart.resize();
        chart.update('none');
      });
    });
  };

  const initializeTabs = () => {
    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => activateTab(button.dataset.tabTarget));
      button.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
          return;
        }

        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
        const nextButton = tabButtons[nextIndex];
        nextButton.focus();
        activateTab(nextButton.dataset.tabTarget);
      });
    });
  };

  const parseSalesRows = (rows) => {
    if (!rows.length) {
      throw new Error('The sales sheet is empty.');
    }

    const headerMap = buildHeaderMap(rows[0]);
    const hourIndex = getColumnIndex(headerMap, ['час', 'hour'], 0);
    const octIndex = getColumnIndex(headerMap, ['окт', 'oct'], 1);
    const novIndex = getColumnIndex(headerMap, ['ное', 'nov'], 2);
    const decIndex = getColumnIndex(headerMap, ['дек', 'dec'], 3);
    const avgIndex = getColumnIndex(headerMap, ['средно', 'average'], 4);
    const changeIndex = getColumnIndex(headerMap, ['промяна окт→дек', 'change oct→dec', 'change'], 5);

    const totalsRow = rows.find((row) => normalizeText(row[hourIndex]) === 'общо');
    const sales = rows
      .slice(1)
      .filter((row) => row[hourIndex] && normalizeText(row[hourIndex]) !== 'общо')
      .map((row) => ({
        label: String(row[hourIndex]),
        oct: Number(row[octIndex]),
        nov: Number(row[novIndex]),
        dec: Number(row[decIndex]),
        avg: Number(row[avgIndex]),
        change: Number(row[changeIndex])
      }));

    if (!sales.length) {
      throw new Error('The sales sheet has no usable data rows.');
    }

    const totals = totalsRow
      ? {
          oct: Number(totalsRow[octIndex]),
          nov: Number(totalsRow[novIndex]),
          dec: Number(totalsRow[decIndex])
        }
      : {
          oct: sales.reduce((sum, row) => sum + row.oct, 0),
          nov: sales.reduce((sum, row) => sum + row.nov, 0),
          dec: sales.reduce((sum, row) => sum + row.dec, 0)
        };

    return { sales, totals };
  };

  const parseReviewRows = (rows) => {
    if (!rows.length) {
      throw new Error('The reviews sheet is empty.');
    }

    const headerMap = buildHeaderMap(rows[0]);
    const dateIndex = getColumnIndex(headerMap, ['дата', 'date'], 0);
    const ratingIndex = getColumnIndex(headerMap, ['оценка (1–5)', 'rating (1-5)', 'rating'], 1);
    const categoryIndex = getColumnIndex(headerMap, ['категория', 'category'], 2);
    const commentIndex = getColumnIndex(headerMap, ['коментар', 'comment'], 3);

    const reviews = rows
      .slice(1)
      .filter((row) => row[dateIndex] && Number.isFinite(Number(row[ratingIndex])))
      .map((row) => ({
        date: String(row[dateIndex]),
        rating: Number(row[ratingIndex]),
        category: String(row[categoryIndex] || 'Other'),
        comment: String(row[commentIndex] || '')
      }));

    if (!reviews.length) {
      throw new Error('The reviews sheet has no usable review rows.');
    }

    return reviews;
  };

  const parseStaffRows = (rows) => {
    if (!rows.length) {
      throw new Error('The staffing sheet is empty.');
    }

    const headerMap = buildHeaderMap(rows[0]);
    const periodIndex = getColumnIndex(headerMap, ['час', 'hour'], 0);
    const weekdayIndexes = ['понеделник', 'вторник', 'сряда', 'четвъртък', 'петък']
      .map((key) => headerMap[key])
      .filter((value) => typeof value === 'number');
    const weekendIndexes = ['събота', 'неделя']
      .map((key) => headerMap[key])
      .filter((value) => typeof value === 'number');

    const schedule = rows
      .slice(1)
      .filter((row) => row[periodIndex] && !normalizeText(row[periodIndex]).startsWith('проблем'))
      .map((row) => {
        const allValues = row
          .slice(1)
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        const weekdayValues = weekdayIndexes
          .map((index) => Number(row[index]))
          .filter((value) => Number.isFinite(value));

        const weekendValues = weekendIndexes
          .map((index) => Number(row[index]))
          .filter((value) => Number.isFinite(value));

        return {
          period: String(row[periodIndex]),
          avgStaff: mean(allValues),
          weekdayStaff: mean(weekdayValues),
          weekendStaff: mean(weekendValues)
        };
      });

    if (!schedule.length) {
      throw new Error('The staffing sheet has no usable schedule rows.');
    }

    return schedule;
  };

  const startHour = (label) => {
    const match = String(label).match(/^(\d{1,2})/);
    return match ? Number(match[1]) : null;
  };

  const periodForHour = (periods, hour) =>
    periods.find((item) => {
      const matches = String(item.period).match(/(\d{1,2}):\d{2}.+?(\d{1,2}):\d{2}/);
      if (!matches) {
        return false;
      }

      const start = Number(matches[1]);
      const end = Number(matches[2]);
      return hour >= start && hour < end;
    });

  const computeMetrics = ({ sales, totals, reviews, staff }) => {
    const avgRating = mean(reviews.map((review) => review.rating));
    const categoryMap = reviews.reduce((accumulator, review) => {
      const bucket = accumulator[review.category] || { name: review.category, count: 0, ratings: [] };
      bucket.count += 1;
      bucket.ratings.push(review.rating);
      accumulator[review.category] = bucket;
      return accumulator;
    }, {});

    const reviewSummary = Object.values(categoryMap)
      .map((item) => ({
        name: item.name,
        count: item.count,
        avgRating: mean(item.ratings)
      }))
      .sort((left, right) => right.count - left.count);

    const peakHour = [...sales].sort((left, right) => right.avg - left.avg)[0];
    const weakestHour = [...sales].sort((left, right) => left.change - right.change)[0];
    const stableHour = [...sales].sort((left, right) => Math.abs(left.change) - Math.abs(right.change))[0];
    const strongestCategory = [...reviewSummary].sort((left, right) => right.avgRating - left.avgRating)[0];
    const painCategory = [...reviewSummary].sort((left, right) => {
      const leftScore = left.count * (6 - left.avgRating);
      const rightScore = right.count * (6 - right.avgRating);
      return rightScore - leftScore;
    })[0];
    const waitCategory = reviewSummary.find((item) => isWaitingCategory(item.name)) || painCategory;

    const salesPressure = sales.map((slot) => {
      const matchedPeriod = periodForHour(staff, startHour(slot.label));
      const weekdayStaff = matchedPeriod && matchedPeriod.weekdayStaff ? matchedPeriod.weekdayStaff : matchedPeriod ? matchedPeriod.avgStaff : 1;

      return {
        label: slot.label,
        pressure: slot.avg / Math.max(weekdayStaff || 1, 1),
        weekdayStaff,
        matchedPeriod: matchedPeriod ? matchedPeriod.period : 'No schedule match'
      };
    });

    const staffHotspot = [...salesPressure].sort((left, right) => right.pressure - left.pressure)[0];
    const dropPercent = totals.oct ? (totals.dec - totals.oct) / totals.oct : 0;
    const waitingShare = waitCategory ? waitCategory.count / Math.max(reviews.length, 1) : 0;
    const lunchWindow = sales.find((slot) => slot.label === '12:00–13:00') || peakHour;
    const monthlyDeltaAverage = mean([totals.nov - totals.oct, totals.dec - totals.nov]);
    const projectedNextMonth = Math.max(0, Math.round(totals.dec + monthlyDeltaAverage));
    const recoverableSales = Math.round(Math.max(totals.oct - totals.dec, 0) * Math.min(waitingShare, 0.6) * 0.5);
    const projectedRecovery = projectedNextMonth + recoverableSales;

    return {
      avgRating,
      dropPercent,
      monthlyTotals: totals,
      peakHour,
      weakestHour,
      stableHour,
      reviewSummary,
      strongestCategory,
      painCategory,
      waitCategory,
      waitingShare,
      staffHotspot,
      salesPressure,
      lunchWindow,
      projectedNextMonth,
      projectedRecovery,
      recoverableSales,
      monthlyDeltaAverage,
      topComments: reviews.slice(0, 3)
    };
  };

  const renderList = (containerId, items) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const list = document.createElement('ul');
    items.forEach((item) => {
      const entry = document.createElement('li');
      entry.textContent = item;
      list.appendChild(entry);
    });

    container.appendChild(list);
  };

  const renderTable = (containerId, rows) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!rows || !rows.length) {
      const empty = document.createElement('p');
      empty.className = 'nbu-table-placeholder';
      empty.textContent = 'No rows available.';
      container.appendChild(empty);
      return;
    }

    const table = document.createElement('table');
    table.className = 'nbu-data-grid';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    rows[0].forEach((cell) => {
      const th = document.createElement('th');
      th.textContent = cell == null ? '' : String(cell);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.slice(1).forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell == null ? '' : String(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  };

  const updateKpis = (metrics) => {
    document.getElementById('kpi-revenue-trend').textContent = formatSignedPercent(metrics.dropPercent);
    document.getElementById('kpi-revenue-copy').textContent =
      `Total sales move from ${metrics.monthlyTotals.oct} in October to ${metrics.monthlyTotals.dec} in December.`;

    document.getElementById('kpi-peak-hour').textContent = metrics.peakHour.label;
    document.getElementById('kpi-peak-copy').textContent =
      `Average hourly sales are ${formatDecimal(metrics.peakHour.avg)}, but this slot is not the one with the worst decline.`;

    document.getElementById('kpi-rating').textContent = `${formatPercent(metrics.waitingShare)}`;
    document.getElementById('kpi-rating-copy').textContent =
      `${metrics.waitCategory.name} accounts for ${formatPercent(metrics.waitingShare)} of reviews and averages ${formatDecimal(metrics.waitCategory.avgRating)}.`;

    document.getElementById('kpi-staffing').textContent = metrics.staffHotspot.label;
    document.getElementById('kpi-staffing-copy').textContent =
      `This slot shows the heaviest weekday load at ${formatDecimal(metrics.staffHotspot.pressure)} sales per scheduled staff member.`;
  };

  const upsertChart = (key, canvasId, config) => {
    const canvas = document.getElementById(canvasId);
    const existingChart = chartRegistry[key];

    if (existingChart) {
      existingChart.destroy();
    }

    chartRegistry[key] = new window.Chart(canvas, config);
  };

  const renderCharts = (parsedData, metrics) => {
    upsertChart('salesTrend', 'sales-trend-chart', {
      type: 'line',
      data: {
        labels: parsedData.sales.map((slot) => slot.label),
        datasets: [
          {
            label: 'October',
            data: parsedData.sales.map((slot) => slot.oct),
            borderColor: colors.blue,
            backgroundColor: colors.blueSoft,
            tension: 0.3,
            fill: false
          },
          {
            label: 'November',
            data: parsedData.sales.map((slot) => slot.nov),
            borderColor: colors.sky,
            backgroundColor: colors.skySoft,
            tension: 0.3,
            fill: false
          },
          {
            label: 'December',
            data: parsedData.sales.map((slot) => slot.dec),
            borderColor: colors.cyan,
            backgroundColor: colors.cyanSoft,
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(44, 34, 48, 0.08)'
            }
          }
        }
      }
    });

    upsertChart('monthlyTotals', 'monthly-totals-chart', {
      type: 'bar',
      data: {
        labels: ['October', 'November', 'December'],
        datasets: [
          {
            data: [metrics.monthlyTotals.oct, metrics.monthlyTotals.nov, metrics.monthlyTotals.dec],
            backgroundColor: [colors.blue, colors.sky, colors.cyan],
            borderRadius: 10
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(44, 34, 48, 0.08)'
            }
          }
        }
      }
    });

    upsertChart('reviews', 'reviews-chart', {
      data: {
        labels: metrics.reviewSummary.map((item) => item.name),
        datasets: [
          {
            type: 'bar',
            label: 'Review count',
            data: metrics.reviewSummary.map((item) => item.count),
            backgroundColor: metrics.reviewSummary.map((item) =>
              isWaitingCategory(item.name) ? colors.navy : colors.blueSoft
            ),
            borderColor: metrics.reviewSummary.map((item) =>
              isWaitingCategory(item.name) ? colors.navy : colors.blue
            ),
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Average rating',
            data: metrics.reviewSummary.map((item) => item.avgRating),
            borderColor: colors.sky,
            backgroundColor: colors.sky,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(44, 34, 48, 0.08)'
            }
          },
          y1: {
            beginAtZero: true,
            max: 5,
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });

    upsertChart('staffing', 'staffing-chart', {
      type: 'bar',
      data: {
        labels: metrics.salesPressure.map((item) => item.label),
        datasets: [
          {
            label: 'Avg sales per weekday staff',
            data: metrics.salesPressure.map((item) => item.pressure),
            backgroundColor: metrics.salesPressure.map((item) =>
              item.label === metrics.staffHotspot.label ? colors.navy : colors.cyanSoft
            ),
            borderColor: metrics.salesPressure.map((item) =>
              item.label === metrics.staffHotspot.label ? colors.navy : colors.cyan
            ),
            borderWidth: 1,
            borderRadius: 10
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(44, 34, 48, 0.08)'
            }
          }
        }
      }
    });

    upsertChart('forecast', 'forecast-chart', {
      type: 'line',
      data: {
        labels: ['October', 'November', 'December', 'January'],
        datasets: [
          {
            label: 'Actual sales',
            data: [metrics.monthlyTotals.oct, metrics.monthlyTotals.nov, metrics.monthlyTotals.dec, null],
            borderColor: colors.blue,
            backgroundColor: colors.blueSoft,
            tension: 0.3,
            fill: false
          },
          {
            label: 'Baseline projection',
            data: [null, null, metrics.monthlyTotals.dec, metrics.projectedNextMonth],
            borderColor: colors.sky,
            backgroundColor: colors.skySoft,
            borderDash: [6, 6],
            tension: 0.25,
            fill: false
          },
          {
            label: 'Service-recovery scenario',
            data: [null, null, metrics.monthlyTotals.dec, metrics.projectedRecovery],
            borderColor: colors.navy,
            backgroundColor: colors.cyanSoft,
            borderDash: [2, 4],
            tension: 0.25,
            fill: false
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(44, 34, 48, 0.08)'
            }
          }
        }
      }
    });
  };

  const renderHeroTab = (metrics) => {
    document.getElementById('hero-tab-summary').textContent =
      `Sales are declining overall, but demand is still clearly present in the morning and at lunch. The hero story is that the business does not lack demand; it lacks enough operational capacity in the most sensitive hours.`;

    document.getElementById('hero-risk-title').textContent = metrics.weakestHour.label;
    document.getElementById('hero-risk-copy').textContent =
      `This hour loses ${formatPercent(metrics.weakestHour.change)} from October to December, making it the clearest visible pressure point.`;

    document.getElementById('hero-stable-title').textContent = metrics.stableHour.label;
    document.getElementById('hero-stable-copy').textContent =
      `This window changes the least over time, which makes it a useful comparison point for students.`;

    document.getElementById('hero-angle-title').textContent = 'Demand vs. operations';
    document.getElementById('hero-angle-copy').textContent =
      `Students can see that a sales decline is not always a demand problem; it can also come from waiting time and staffing friction.`;
  };

  const renderNarrative = (metrics) => {
    renderList('strengths-list', [
      `${metrics.peakHour.label} remains the top-performing hour, showing that morning demand still exists even while performance slips.`,
      `${metrics.lunchWindow.label} stays comparatively stable, which suggests the operation performs better once the early rush passes.`,
      `${metrics.strongestCategory.name} reviews average ${formatDecimal(metrics.strongestCategory.avgRating)} out of 5, so the sheet does not point to a universal quality problem.`
    ]);

    renderList('weaknesses-list', [
      `${metrics.weakestHour.label} shows the sharpest October-to-December drop at ${formatPercent(metrics.weakestHour.change)}.`,
      `${metrics.waitCategory.name} is the dominant operational issue, accounting for ${formatPercent(metrics.waitingShare)} of all customer comments.`,
      `${metrics.staffHotspot.label} carries the highest load per scheduled staff member, which points to an operational bottleneck rather than a demand problem.`
    ]);

    document.getElementById('story-summary').textContent =
      `Demand is strongest in the morning and around lunch, but the business is losing momentum because the busiest early slot is also the most strained. In this workbook, the review sheet is mainly evidence about waiting time, and that waiting-time signal lines up with the staffing schedule.`;

    renderList('actions-list', [
      `Test one extra barista during ${metrics.staffHotspot.matchedPeriod} on weekdays and watch whether the morning decline starts to reverse.`,
      `Track queue time as an operational KPI alongside sales so students can see how waiting time affects both ratings and repeat demand.`,
      `Compare the next month of data with this baseline to decide whether the issue is staffing, service process, or a broader market shift.`
    ]);

    renderList('questions-list', [
      'Which metric changes your recommendation the most: sales decline, waiting-time reviews, or staffing load?',
      'If you could fund only one intervention, would you add staff, redesign the morning workflow, or change the offer?',
      'What extra data would make this dashboard stronger: queue time, margin by product, repeat customers, or weather?'
    ]);
  };

  const renderPrediction = (metrics) => {
    document.getElementById('prediction-summary').textContent =
      `This is a classroom forecast, not a production model. It shows what January could look like if the current decline continues, and what a partial service recovery could look like if waiting time improves.`;

    document.getElementById('prediction-baseline-title').textContent = `${metrics.projectedNextMonth} sales`;
    document.getElementById('prediction-baseline-copy').textContent =
      `Baseline January projection using the average monthly change from October to December (${metrics.monthlyDeltaAverage.toFixed(1)} sales per month).`;

    document.getElementById('prediction-recovery-title').textContent = `${metrics.projectedRecovery} sales`;
    document.getElementById('prediction-recovery-copy').textContent =
      `Service-recovery scenario adds back about ${metrics.recoverableSales} sales if waiting pressure is partly reduced.`;

    document.getElementById('prediction-watch-title').textContent = metrics.weakestHour.label;
    document.getElementById('prediction-watch-copy').textContent =
      `Watch ${metrics.weakestHour.label} first. If that slot does not improve, the broader monthly trend is unlikely to recover.`;

    renderList('prediction-list', [
      `Baseline projection: extend the average month-to-month decline from October, November, and December into January.`,
      `Recovery scenario: assume some of the ${metrics.monthlyTotals.oct - metrics.monthlyTotals.dec} lost sales can be recovered if waiting-related friction is reduced.`,
      `Interpretation rule: these are teaching scenarios for discussion, not statistically validated forecasts.`
    ]);

    renderList('prediction-questions', [
      'Which assumption is weakest: the linear trend, the recovery percentage, or the link between waiting time and sales?',
      'What new data would make the forecast stronger: queue time, conversion rate, product mix, or competitor activity?',
      'How would you test whether a staffing change actually moved the business toward the recovery scenario?'
    ]);
  };

  const renderRawData = (parsedData) => {
    document.getElementById('raw-data-summary').textContent =
      `These are the source rows used by the dashboard. Students can compare the raw workbook structure with the KPI, chart, and story layers in the other tabs.`;

    renderTable('raw-sales-table', parsedData.raw.salesRows);
    renderTable('raw-reviews-table', parsedData.raw.reviewRows);
    renderTable('raw-staff-table', parsedData.raw.staffRows);
  };

  const parseWorkbookData = (rowsBySheet) => {
    const parsedSales = parseSalesRows(rowsBySheet.salesRows);
    const reviews = parseReviewRows(rowsBySheet.reviewRows);
    const staff = parseStaffRows(rowsBySheet.staffRows);

    return {
      sales: parsedSales.sales,
      totals: parsedSales.totals,
      reviews,
      staff,
      raw: rowsBySheet
    };
  };

  const renderDashboard = (parsedData, label) => {
    const metrics = computeMetrics(parsedData);
    updateKpis(metrics);
    renderCharts(parsedData, metrics);
    renderHeroTab(metrics);
    renderNarrative(metrics);
    renderPrediction(metrics);
    renderRawData(parsedData);
    setStatus(`Loaded ${label}. The dashboard is using ${parsedData.sales.length} sales rows, ${parsedData.reviews.length} reviews, and ${parsedData.staff.length} staffing windows.`, 'success');
  };

  const workbookToRows = (workbook) => {
    const salesSheetName = findSheetName(workbook, ['продажби по часове', 'sales']);
    const reviewsSheetName = findSheetName(workbook, ['отзиви на клиенти', 'reviews']);
    const staffSheetName = findSheetName(workbook, ['график на персонала', 'staff']);

    if (!salesSheetName || !reviewsSheetName || !staffSheetName) {
      throw new Error('The workbook is missing one of the required tabs for sales, reviews, or staff schedule.');
    }

    return {
      salesRows: window.XLSX.utils.sheet_to_json(workbook.Sheets[salesSheetName], {
        header: 1,
        blankrows: false,
        defval: null
      }),
      reviewRows: window.XLSX.utils.sheet_to_json(workbook.Sheets[reviewsSheetName], {
        header: 1,
        blankrows: false,
        defval: null
      }),
      staffRows: window.XLSX.utils.sheet_to_json(workbook.Sheets[staffSheetName], {
        header: 1,
        blankrows: false,
        defval: null
      })
    };
  };

  const loadParsedRows = (rowsBySheet, label) => {
    const parsedData = parseWorkbookData(rowsBySheet);
    renderDashboard(parsedData, label);
  };

  demoButton.addEventListener('click', () => {
    loadParsedRows(demoWorkbook, 'the embedded demo dataset');
  });

  fileInput.addEventListener('change', async (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    setStatus(`Loading ${file.name}...`, 'loading');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(buffer, { type: 'array' });
      const rowsBySheet = workbookToRows(workbook);
      loadParsedRows(rowsBySheet, file.name);
    } catch (error) {
      setStatus(error.message || 'The file could not be processed.', 'error');
    }
  });

  initializeTabs();
  loadParsedRows(demoWorkbook, 'the embedded demo dataset');
});
