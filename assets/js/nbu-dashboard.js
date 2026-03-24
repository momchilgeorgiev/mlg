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
  const widgetTitleInput = document.getElementById('widget-title-input');
  const widgetTypeSelect = document.getElementById('widget-type-select');
  const widgetSheetSelect = document.getElementById('widget-sheet-select');
  const widgetMetricFields = document.getElementById('widget-metric-fields');
  const widgetSourceSelect = document.getElementById('widget-source-select');
  const widgetChartFields = document.getElementById('widget-chart-fields');
  const widgetChartTypeSelect = document.getElementById('widget-chart-type-select');
  const widgetXSelect = document.getElementById('widget-x-select');
  const widgetSeriesField = document.getElementById('widget-series-field');
  const widgetSeriesOptions = document.getElementById('widget-series-options');
  const widgetChartOptions = document.getElementById('widget-chart-options');
  const widgetChartAggregateSelect = document.getElementById('widget-chart-aggregate-select');
  const widgetChartSortSelect = document.getElementById('widget-chart-sort-select');
  const widgetChartLimitSelect = document.getElementById('widget-chart-limit-select');
  const widgetChartPaletteSelect = document.getElementById('widget-chart-palette-select');
  const widgetChartHelper = document.getElementById('widget-chart-helper');
  const widgetTableFields = document.getElementById('widget-table-fields');
  const widgetTableLimitSelect = document.getElementById('widget-table-limit-select');
  const widgetTableHelper = document.getElementById('widget-table-helper');
  const widgetSizeSelect = document.getElementById('widget-size-select');
  const widgetNoteField = document.getElementById('widget-note-field');
  const widgetNoteInput = document.getElementById('widget-note-input');
  const addWidgetButton = document.getElementById('add-widget-button');
  const resetWidgetsButton = document.getElementById('reset-widgets-button');
  const builderCanvas = document.getElementById('builder-canvas');
  const builderPresets = document.getElementById('builder-presets');
  const builderState = {
    widgets: [],
    nextId: 1,
    parsedData: null,
    metrics: null
  };
  const sheetRowKeys = {
    sales: 'salesRows',
    reviews: 'reviewRows',
    staff: 'staffRows'
  };
  const sheetLabels = {
    sales: 'Продажби по часове',
    reviews: 'Отзиви на клиенти',
    staff: 'График на персонала'
  };
  const chartTypeLabels = {
    bar: 'Bar chart',
    line: 'Line chart',
    area: 'Area chart',
    'horizontal-bar': 'Horizontal bar',
    doughnut: 'Doughnut chart'
  };
  const chartAggregateLabels = {
    none: 'Raw rows',
    sum: 'Sum by X',
    average: 'Average by X',
    count: 'Count by X',
    min: 'Minimum by X',
    max: 'Maximum by X'
  };
  const chartSortLabels = {
    sheet: 'Sheet order',
    'x-asc': 'X: A to Z',
    'x-desc': 'X: Z to A',
    'y-desc': 'Y: High to low',
    'y-asc': 'Y: Low to high'
  };
  const chartPaletteLabels = {
    ocean: 'Ocean',
    contrast: 'Contrast',
    warm: 'Warm'
  };

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
  const chartPalettes = {
    ocean: {
      fills: ['rgba(0, 91, 170, 0.78)', 'rgba(29, 132, 214, 0.74)', 'rgba(66, 180, 230, 0.7)', 'rgba(0, 67, 127, 0.8)'],
      borders: ['#005baa', '#1d84d6', '#42b4e6', '#00437f'],
      line: '#005baa',
      areaFill: 'rgba(29, 132, 214, 0.22)'
    },
    contrast: {
      fills: ['rgba(0, 67, 127, 0.82)', 'rgba(227, 104, 42, 0.78)', 'rgba(30, 130, 76, 0.78)', 'rgba(135, 35, 65, 0.78)'],
      borders: ['#00437f', '#e3682a', '#1e824c', '#872341'],
      line: '#00437f',
      areaFill: 'rgba(227, 104, 42, 0.22)'
    },
    warm: {
      fills: ['rgba(232, 120, 55, 0.8)', 'rgba(246, 170, 28, 0.78)', 'rgba(197, 80, 56, 0.76)', 'rgba(153, 70, 51, 0.78)'],
      borders: ['#e87837', '#f6aa1c', '#c55038', '#994633'],
      line: '#c55038',
      areaFill: 'rgba(246, 170, 28, 0.22)'
    }
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

  const isBlankCell = (value) => value == null || String(value).trim() === '';
  const isNumericCell = (value) => !isBlankCell(value) && Number.isFinite(Number(value));

  const getSheetRowsForBuilder = (parsedData, sheet) =>
    parsedData && parsedData.raw ? parsedData.raw[sheetRowKeys[sheet]] || [] : [];

  const getSheetColumns = (parsedData, sheet) => {
    const rows = getSheetRowsForBuilder(parsedData, sheet);
    if (!rows.length) {
      return [];
    }

    const width = rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
    const headerRow = rows[0] || [];
    const bodyRows = rows.slice(1).filter((row) =>
      Array.isArray(row) ? row.some((value) => !isBlankCell(value)) : false
    );

    return Array.from({ length: width }, (_, index) => {
      const values = bodyRows.map((row) => row[index]);
      const filledValues = values.filter((value) => !isBlankCell(value));

      return {
        index,
        label: isBlankCell(headerRow[index]) ? `Column ${index + 1}` : String(headerRow[index]),
        filledCount: filledValues.length,
        numericCount: filledValues.filter((value) => isNumericCell(value)).length
      };
    });
  };

  const populateSelect = (select, options, emptyLabel) => {
    const previousValue = select.value;
    select.innerHTML = '';

    if (!options.length) {
      const node = document.createElement('option');
      node.value = '';
      node.textContent = emptyLabel;
      select.appendChild(node);
      select.value = '';
      select.disabled = true;
      return '';
    }

    options.forEach((option) => {
      const node = document.createElement('option');
      node.value = option.value;
      node.textContent = option.label;
      select.appendChild(node);
    });

    select.disabled = false;
    select.value = options.some((option) => option.value === previousValue) ? previousValue : options[0].value;
    return select.value;
  };

  const getSelectedOptionLabel = (select) => {
    const option = select.options[select.selectedIndex];
    return option ? option.textContent : '';
  };

  const getSelectedSeriesColumns = () =>
    Array.from(widgetSeriesOptions.querySelectorAll('input[type="checkbox"]:checked'))
      .map((input) => Number(input.value))
      .filter((value) => Number.isInteger(value));

  const populateSeriesOptions = (columns, xColumn) => {
    const previousSelection = getSelectedSeriesColumns();
    const numericColumns = columns.filter(
      (column) => column.numericCount > 0 && column.index !== Number(xColumn)
    );

    widgetSeriesOptions.innerHTML = '';

    if (!numericColumns.length) {
      const empty = document.createElement('p');
      empty.className = 'nbu-series-empty';
      empty.textContent = 'No numeric columns available for chart series.';
      widgetSeriesOptions.appendChild(empty);
      return [];
    }

    const nextSelection = previousSelection.filter((value) =>
      numericColumns.some((column) => column.index === value)
    );
    const selectedValues = nextSelection.length ? nextSelection : [numericColumns[0].index];

    numericColumns.forEach((column) => {
      const label = document.createElement('label');
      label.className = 'nbu-series-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = String(column.index);
      checkbox.checked = selectedValues.includes(column.index);

      const text = document.createElement('span');
      text.textContent = column.label;

      label.append(checkbox, text);
      widgetSeriesOptions.appendChild(label);
    });

    return selectedValues;
  };

  const getLimitValue = (value) => (value === 'all' ? null : Math.max(Number(value) || 0, 0));

  const compareMixedValues = (left, right) => {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const bothNumeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);

    if (bothNumeric) {
      return leftNumber - rightNumber;
    }

    return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
  };

  const getPalette = (name, count) => {
    const palette = chartPalettes[name] || chartPalettes.ocean;
    return {
      fills: Array.from({ length: count }, (_, index) => palette.fills[index % palette.fills.length]),
      borders: Array.from({ length: count }, (_, index) => palette.borders[index % palette.borders.length]),
      line: palette.line,
      areaFill: palette.areaFill
    };
  };

  const aggregateValues = (values, mode) => {
    if (!values.length) {
      return null;
    }

    if (mode === 'sum') {
      return values.reduce((sum, value) => sum + value, 0);
    }

    if (mode === 'average') {
      return mean(values);
    }

    if (mode === 'count') {
      return values.length;
    }

    if (mode === 'min') {
      return Math.min(...values);
    }

    if (mode === 'max') {
      return Math.max(...values);
    }

    return values[0];
  };

  const buildChartSeries = (widget, parsedData) => {
    const rows = getSheetRowsForBuilder(parsedData, widget.sheet);
    const xColumn = Number(widget.xColumn);
    const seriesColumns = (widget.seriesColumns || []).map(Number).filter((value) => Number.isInteger(value));

    if (rows.length < 2 || !Number.isInteger(xColumn) || !seriesColumns.length) {
      return { records: [], seriesColumns: [] };
    }

    const rowValues = rows
      .slice(1)
      .filter(
        (row) =>
          !isBlankCell(row[xColumn]) &&
          seriesColumns.some((columnIndex) => isNumericCell(row[columnIndex]))
      )
      .map((row, index) => ({
        x: String(row[xColumn]),
        values: seriesColumns.map((columnIndex) =>
          isNumericCell(row[columnIndex]) ? Number(row[columnIndex]) : null
        ),
        order: index
      }));

    if (!rowValues.length) {
      return { records: [], seriesColumns };
    }

    let records;

    if (widget.chartAggregate && widget.chartAggregate !== 'none') {
      const grouped = rowValues.reduce((map, row) => {
        const bucket =
          map.get(row.x) ||
          {
            x: row.x,
            values: Array.from({ length: seriesColumns.length }, () => []),
            order: row.order
          };
        row.values.forEach((value, valueIndex) => {
          if (Number.isFinite(value)) {
            bucket.values[valueIndex].push(value);
          }
        });
        bucket.order = Math.min(bucket.order, row.order);
        map.set(row.x, bucket);
        return map;
      }, new Map());

      records = Array.from(grouped.values()).map((entry) => ({
        x: entry.x,
        values: entry.values.map((valueBucket) => aggregateValues(valueBucket, widget.chartAggregate)),
        order: entry.order
      }));
    } else {
      records = rowValues;
    }

    const sortMode = widget.chartSort || 'sheet';
    if (sortMode === 'x-asc') {
      records.sort((left, right) => compareMixedValues(left.x, right.x));
    } else if (sortMode === 'x-desc') {
      records.sort((left, right) => compareMixedValues(right.x, left.x));
    } else if (sortMode === 'y-asc') {
      records.sort((left, right) => {
        const leftValue = Number.isFinite(left.values[0]) ? left.values[0] : Number.POSITIVE_INFINITY;
        const rightValue = Number.isFinite(right.values[0]) ? right.values[0] : Number.POSITIVE_INFINITY;
        return leftValue - rightValue;
      });
    } else if (sortMode === 'y-desc') {
      records.sort((left, right) => {
        const leftValue = Number.isFinite(left.values[0]) ? left.values[0] : Number.NEGATIVE_INFINITY;
        const rightValue = Number.isFinite(right.values[0]) ? right.values[0] : Number.NEGATIVE_INFINITY;
        return rightValue - leftValue;
      });
    } else {
      records.sort((left, right) => left.order - right.order);
    }

    const limit = getLimitValue(widget.chartLimit || 'all');
    return {
      records: limit ? records.slice(0, limit) : records,
      seriesColumns
    };
  };

  const formatWidgetSetting = (widget, columns) => {
    if (widget.type === 'chart') {
      const xColumn = columns.find((column) => column.index === Number(widget.xColumn));
      const seriesLabels = (widget.seriesColumns || [])
        .map((seriesIndex) => columns.find((column) => column.index === Number(seriesIndex)))
        .filter(Boolean)
        .map((column) => column.label);
      const pieces = [
        chartTypeLabels[widget.chartType] || widget.chartType,
        xColumn ? `X: ${xColumn.label}` : null,
        seriesLabels.length ? `Series: ${seriesLabels.join(', ')}` : null,
        `Mode: ${chartAggregateLabels[widget.chartAggregate] || chartAggregateLabels.none}`,
        widget.chartSort && widget.chartSort !== 'sheet' ? `Sort: ${chartSortLabels[widget.chartSort] || widget.chartSort}` : null,
        widget.chartLimit && widget.chartLimit !== 'all' ? `Limit: ${widget.chartLimit}` : 'Limit: all',
        widget.chartPalette ? `Palette: ${chartPaletteLabels[widget.chartPalette] || widget.chartPalette}` : null
      ].filter(Boolean);

      return pieces.join(' | ');
    }

    if (widget.type === 'table') {
      return widget.tableLimit && widget.tableLimit !== 'all' ? `Rows shown: ${widget.tableLimit}` : 'Rows shown: all';
    }

    return '';
  };

  const getBuilderSourceOptions = (type, sheet) => {
    if (!builderState.metrics || !builderState.parsedData) {
      return [];
    }

    if (type === 'big-number') {
      if (sheet === 'sales') {
        return [
          { value: 'revenue-change', label: 'Промяна Окт→Дек' },
          { value: 'peak-hour', label: 'Час (пик)' }
        ];
      }

      if (sheet === 'reviews') {
        return [{ value: 'waiting-share', label: 'Чакане / % от всички' }];
      }

      return [{ value: 'staffing-hotspot', label: 'График на персонала / натоварване' }];
    }

    if (type === 'table') {
      if (sheet === 'sales') {
        return [{ value: 'sales-table', label: 'Продажби по часове' }];
      }

      if (sheet === 'reviews') {
        return [{ value: 'reviews-table', label: 'Отзиви на клиенти' }];
      }

      return [{ value: 'staff-table', label: 'График на персонала' }];
    }

    return [];
  };

  const getDefaultTableSource = (sheet) => {
    if (sheet === 'sales') {
      return 'sales-table';
    }

    if (sheet === 'reviews') {
      return 'reviews-table';
    }

    return 'staff-table';
  };

  const getBuilderSourceLabel = (type, sheet, source) => {
    const match = getBuilderSourceOptions(type, sheet).find((option) => option.value === source);
    return match ? match.label : sheetLabels[sheet] || 'Custom widget';
  };

  const getDefaultWidgetTitle = (type, sheet, source) => {
    if (type === 'note') {
      return 'Class note';
    }

    if (type === 'chart') {
      const xLabel = getSelectedOptionLabel(widgetXSelect);
      const seriesLabels = Array.from(widgetSeriesOptions.querySelectorAll('input[type="checkbox"]:checked'))
        .map((input) => input.nextElementSibling && input.nextElementSibling.textContent)
        .filter(Boolean);

      if (xLabel && seriesLabels.length === 1) {
        return `${seriesLabels[0]} by ${xLabel}`;
      }

      if (xLabel && seriesLabels.length > 1) {
        return `${seriesLabels.length} series by ${xLabel}`;
      }

      return `${sheetLabels[sheet]} chart`;
    }

    return getBuilderSourceLabel(type, sheet, source);
  };

  const syncBuilderControls = () => {
    const type = widgetTypeSelect.value;
    const isNote = type === 'note';
    const isChart = type === 'chart';
    const isTable = type === 'table';
    const isBigNumber = type === 'big-number';
    const sheet = widgetSheetSelect.value;

    widgetNoteField.hidden = !isNote;
    widgetSheetSelect.disabled = isNote;
    widgetMetricFields.hidden = !isBigNumber;
    widgetSourceSelect.disabled = !isBigNumber;
    widgetChartFields.hidden = !isChart;
    widgetSeriesField.hidden = !isChart;
    widgetChartOptions.hidden = !isChart;
    widgetChartHelper.hidden = !isChart;
    widgetChartTypeSelect.disabled = !isChart;
    widgetChartAggregateSelect.disabled = !isChart;
    widgetChartSortSelect.disabled = !isChart;
    widgetChartLimitSelect.disabled = !isChart;
    widgetChartPaletteSelect.disabled = !isChart;
    widgetTableFields.hidden = !isTable;
    widgetTableHelper.hidden = !isTable;
    widgetTableLimitSelect.disabled = !isTable;

    if (isBigNumber) {
      populateSelect(widgetSourceSelect, getBuilderSourceOptions(type, sheet), 'Load a workbook first');
    }

    if (isChart) {
      const columns = getSheetColumns(builderState.parsedData, sheet);
      const xOptions = columns
        .filter((column) => column.filledCount > 0)
        .map((column) => ({
          value: String(column.index),
          label: column.label
        }));

      populateSelect(widgetXSelect, xOptions, 'Load a workbook first');
      const selectedSeries = populateSeriesOptions(columns, widgetXSelect.value);

      if (!builderState.parsedData) {
        widgetChartHelper.textContent = 'Load a workbook first, then choose the X-axis and one or more series columns.';
      } else if (!xOptions.length) {
        widgetChartHelper.textContent = 'This sheet has no filled columns available for the X-axis.';
      } else if (!selectedSeries.length) {
        widgetChartHelper.textContent = 'This sheet has no numeric columns available for chart series.';
      } else if (widgetChartTypeSelect.value === 'doughnut') {
        widgetChartHelper.textContent =
          'Doughnut charts use one numeric series column. For month-to-month comparisons, use bar, line, or area charts.';
      } else {
        widgetChartHelper.textContent =
          'Choose an X-axis and one or more series columns. For monthly charts, select multiple month columns like Окт, Ное, and Дек.';
      }
    }

    if (isTable) {
      widgetTableHelper.textContent =
        'Tables can show the full sheet or only the first rows when you want a compact supporting widget.';
    }
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

  const buildDataTableElement = (rows) => {
    if (!rows || !rows.length) {
      const empty = document.createElement('p');
      empty.className = 'nbu-table-placeholder';
      empty.textContent = 'No rows available.';
      return empty;
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
    return table;
  };

  const renderTable = (containerId, rows) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(buildDataTableElement(rows));
  };

  const destroyBuilderCharts = () => {
    Object.keys(chartRegistry)
      .filter((key) => key.startsWith('builder-'))
      .forEach((key) => {
        chartRegistry[key].destroy();
        delete chartRegistry[key];
      });
  };

  const getBuilderChartConfig = (widget, parsedData) => {
    const columns = getSheetColumns(parsedData, widget.sheet);
    const chartSeries = buildChartSeries(widget, parsedData);
    const seriesMeta = chartSeries.seriesColumns
      .map((seriesIndex) => columns.find((column) => column.index === Number(seriesIndex)))
      .filter(Boolean);
    const records = chartSeries.records;

    if (!records.length || !seriesMeta.length) {
      return null;
    }

    const palette = getPalette(widget.chartPalette || 'ocean', Math.max(seriesMeta.length, records.length));
    const labels = records.map((item) => item.x);
    const chartType = widget.chartType || 'bar';
    const supportsMultipleSeries = chartType !== 'doughnut';

    if (!supportsMultipleSeries && seriesMeta.length > 1) {
      return null;
    }

    const datasets =
      chartType === 'doughnut'
        ? [
            {
              label: seriesMeta[0].label,
              data: records.map((item) => item.values[0]),
              backgroundColor: palette.fills.slice(0, records.length),
              borderColor: palette.borders.slice(0, records.length),
              borderWidth: 2
            }
          ]
        : seriesMeta.map((seriesColumn, index) => {
            const dataset = {
              label: seriesColumn.label,
              data: records.map((item) => item.values[index]),
              borderColor: palette.borders[index % palette.borders.length],
              backgroundColor:
                chartType === 'line'
                  ? palette.borders[index % palette.borders.length]
                  : chartType === 'area'
                    ? palette.fills[index % palette.fills.length]
                    : palette.fills[index % palette.fills.length],
              borderWidth: 2
            };

            if (chartType === 'line' || chartType === 'area') {
              dataset.tension = 0.3;
              dataset.fill = chartType === 'area';
              dataset.pointRadius = 3;
              dataset.pointHoverRadius = 5;
            } else {
              dataset.borderRadius = 10;
            }

            return dataset;
          });

    const config = {
      type: chartType === 'horizontal-bar' ? 'bar' : chartType === 'area' ? 'line' : chartType,
      data: {
        labels,
        datasets
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasets.length > 1 || chartType === 'doughnut',
            position: 'bottom'
          }
        }
      }
    };

    if (chartType === 'horizontal-bar') {
      config.options.indexAxis = 'y';
    }

    if (chartType !== 'doughnut') {
      const valueAxis = chartType === 'horizontal-bar' ? 'x' : 'y';
      config.options.scales = {
        [valueAxis]: {
          beginAtZero: true,
          grid: {
            color: 'rgba(44, 34, 48, 0.08)'
          }
        }
      };
    }

    return config;
  };

  const renderBuilderPresets = () => {
    builderPresets.innerHTML = '';

    if (!builderState.metrics || !builderState.parsedData) {
      const empty = document.createElement('p');
      empty.className = 'nbu-builder-placeholder';
      empty.textContent = 'Load data to unlock starter metric and table widgets.';
      builderPresets.appendChild(empty);
      return;
    }

    const presets = [
      { type: 'big-number', sheet: 'sales', source: 'revenue-change', size: 'small', title: 'Промяна Окт→Дек' },
      { type: 'big-number', sheet: 'reviews', source: 'waiting-share', size: 'small', title: 'Чакане / % от всички' },
      { type: 'big-number', sheet: 'staff', source: 'staffing-hotspot', size: 'small', title: 'Най-натоварен слот' },
      { type: 'table', sheet: 'sales', source: 'sales-table', size: 'wide', title: 'Продажби по часове' },
      { type: 'table', sheet: 'reviews', source: 'reviews-table', size: 'wide', title: 'Отзиви на клиенти' }
    ];

    presets.forEach((preset) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nbu-preset-chip';
      button.textContent = preset.title;
      button.addEventListener('click', () => {
        builderState.widgets.push({ id: builderState.nextId++, ...preset });
        renderBuilderCanvas();
      });
      builderPresets.appendChild(button);
    });
  };

  const getBigNumberContent = (source, metrics) => {
    if (source === 'revenue-change') {
      return {
        value: formatSignedPercent(metrics.dropPercent),
        copy: `From ${metrics.monthlyTotals.oct} in October to ${metrics.monthlyTotals.dec} in December.`
      };
    }

    if (source === 'peak-hour') {
      return {
        value: metrics.peakHour.label,
        copy: `Average hourly sales: ${formatDecimal(metrics.peakHour.avg)}.`
      };
    }

    if (source === 'waiting-share') {
      return {
        value: formatPercent(metrics.waitingShare),
        copy: `${metrics.waitCategory.name} reviews average ${formatDecimal(metrics.waitCategory.avgRating)}.`
      };
    }

    if (source === 'staffing-hotspot') {
      return {
        value: metrics.staffHotspot.label,
        copy: `Pressure score: ${formatDecimal(metrics.staffHotspot.pressure)} sales per weekday staff member.`
      };
    }

    if (source === 'baseline-forecast') {
      return {
        value: `${metrics.projectedNextMonth}`,
        copy: 'Projected next-month sales if the current trend continues.'
      };
    }

    return {
      value: `${metrics.projectedRecovery}`,
      copy: `Recovery scenario adds about ${metrics.recoverableSales} sales.`
    };
  };

  const getTableRowsForSource = (source, parsedData) => {
    if (source === 'sales-table') {
      return parsedData.raw.salesRows;
    }

    if (source === 'reviews-table') {
      return parsedData.raw.reviewRows;
    }

    return parsedData.raw.staffRows;
  };

  const getTableDisplayRows = (widget, parsedData) => {
    const rows = getTableRowsForSource(widget.source, parsedData);
    const limit = getLimitValue(widget.tableLimit || 'all');

    if (!limit || rows.length <= 1) {
      return rows;
    }

    return [rows[0], ...rows.slice(1, limit + 1)];
  };

  const buildWidgetMessage = (message) => {
    const copy = document.createElement('p');
    copy.className = 'nbu-widget-copy';
    copy.textContent = message;
    return copy;
  };

  const renderBuilderCanvas = () => {
    destroyBuilderCharts();
    builderCanvas.innerHTML = '';

    if (!builderState.widgets.length) {
      const empty = document.createElement('div');
      empty.className = 'nbu-builder-empty';
      empty.innerHTML = `
        <h3>Start building</h3>
        <p>Add a big number, chart, table, or note. This canvas is meant to feel like a simple classroom version of Grafana or BI dashboard building.</p>
      `;
      builderCanvas.appendChild(empty);
      return;
    }

    builderState.widgets.forEach((widget, index) => {
      const card = document.createElement('article');
      card.className = `nbu-widget-card nbu-widget-card--${widget.size || 'medium'}`;
      const widgetColumns = getSheetColumns(builderState.parsedData, widget.sheet);

      const header = document.createElement('div');
      header.className = 'nbu-widget-header';
      const headingBlock = document.createElement('div');
      const typeLabel = document.createElement('p');
      typeLabel.className = 'nbu-widget-type';
      typeLabel.textContent =
        widget.type === 'chart' ? chartTypeLabels[widget.chartType] || 'Chart' : widget.type.replace('-', ' ');
      const title = document.createElement('h3');
      title.textContent = widget.title;
      headingBlock.append(typeLabel, title);

      const actions = document.createElement('div');
      actions.className = 'nbu-widget-actions';
      actions.innerHTML = `
        <button class="nbu-widget-btn" type="button" data-action="up" data-id="${widget.id}" aria-label="Move widget up">&#8593;</button>
        <button class="nbu-widget-btn" type="button" data-action="down" data-id="${widget.id}" aria-label="Move widget down">&#8595;</button>
        <button class="nbu-widget-btn" type="button" data-action="remove" data-id="${widget.id}" aria-label="Remove widget">&times;</button>
      `;
      if (index === 0) {
        actions.querySelector('[data-action="up"]').disabled = true;
      }
      if (index === builderState.widgets.length - 1) {
        actions.querySelector('[data-action="down"]').disabled = true;
      }
      header.appendChild(headingBlock);
      header.appendChild(actions);
      card.appendChild(header);

      const settings = formatWidgetSetting(widget, widgetColumns);
      if (settings) {
        const meta = document.createElement('p');
        meta.className = 'nbu-widget-meta';
        meta.textContent = settings;
        card.appendChild(meta);
      }

      if (widget.type === 'big-number') {
        const content = getBigNumberContent(widget.source, builderState.metrics);
        const value = document.createElement('div');
        value.className = 'nbu-widget-value';
        value.textContent = content.value;
        const copy = document.createElement('p');
        copy.className = 'nbu-widget-copy';
        copy.textContent = content.copy;
        card.append(value, copy);
      } else if (widget.type === 'chart') {
        const chartConfig = getBuilderChartConfig(widget, builderState.parsedData);
        const xColumn = widgetColumns.find((column) => column.index === Number(widget.xColumn));
        const seriesLabels = (widget.seriesColumns || [])
          .map((seriesIndex) => widgetColumns.find((column) => column.index === Number(seriesIndex)))
          .filter(Boolean)
          .map((column) => column.label);

        card.appendChild(
          buildWidgetMessage(
            `${sheetLabels[widget.sheet]}: ${xColumn ? xColumn.label : 'X'} with ${
              seriesLabels.length ? seriesLabels.join(', ') : 'selected series'
            }.`
          )
        );

        if (!chartConfig) {
          card.appendChild(
            buildWidgetMessage(
              'This chart could not be rendered from the selected columns. Choose a filled X column and valid numeric series columns.'
            )
          );
        } else {
          const canvas = document.createElement('canvas');
          const canvasId = `builder-chart-${widget.id}`;
          canvas.id = canvasId;
          canvas.className = 'nbu-widget-chart';
          card.appendChild(canvas);
          upsertChart(`builder-${widget.id}`, canvas, chartConfig);
        }
      } else if (widget.type === 'table') {
        const tableWrap = document.createElement('div');
        tableWrap.className = 'nbu-widget-table nbu-table-wrap';
        tableWrap.appendChild(buildDataTableElement(getTableDisplayRows(widget, builderState.parsedData)));
        card.appendChild(tableWrap);
      } else {
        const note = document.createElement('p');
        note.className = 'nbu-widget-note';
        note.textContent = widget.note;
        card.appendChild(note);
      }

      builderCanvas.appendChild(card);
    });
  };

  const initializeBuilder = () => {
    widgetTypeSelect.addEventListener('change', syncBuilderControls);
    widgetSheetSelect.addEventListener('change', syncBuilderControls);
    widgetXSelect.addEventListener('change', syncBuilderControls);
    widgetChartTypeSelect.addEventListener('change', syncBuilderControls);

    addWidgetButton.addEventListener('click', () => {
      const type = widgetTypeSelect.value;
      const sheet = widgetSheetSelect.value;
      const size = widgetSizeSelect.value;
      const source = type === 'big-number' ? widgetSourceSelect.value : type === 'table' ? getDefaultTableSource(sheet) : '';
      const chartType = widgetChartTypeSelect.value;
      const xColumn = widgetXSelect.value;
      const seriesColumns = getSelectedSeriesColumns();
      const chartAggregate = widgetChartAggregateSelect.value;
      const chartSort = widgetChartSortSelect.value;
      const chartLimit = widgetChartLimitSelect.value;
      const chartPalette = widgetChartPaletteSelect.value;
      const tableLimit = widgetTableLimitSelect.value;
      const note = widgetNoteInput.value.trim();
      const defaultTitle = getDefaultWidgetTitle(type, sheet, source);
      const title = widgetTitleInput.value.trim() || defaultTitle;

      if (type === 'note' && !note) {
        setStatus('Add note text before creating a note widget.', 'error');
        return;
      }

      if (type !== 'note' && !builderState.parsedData) {
        setStatus('Load a workbook before adding data-driven widgets.', 'error');
        return;
      }

      if (type === 'chart' && (!xColumn || !seriesColumns.length)) {
        setStatus('Choose an X-axis column and at least one series column before creating a chart widget.', 'error');
        return;
      }

      if (type === 'chart' && chartType === 'doughnut' && seriesColumns.length > 1) {
        setStatus('Doughnut charts can use only one series column. Pick a single series or use a bar/line chart.', 'error');
        return;
      }

      builderState.widgets.push({
        id: builderState.nextId++,
        type,
        sheet,
        source,
        chartType,
        chartAggregate,
        chartSort,
        chartLimit,
        chartPalette,
        seriesColumns: type === 'chart' ? seriesColumns : [],
        xColumn: type === 'chart' ? Number(xColumn) : null,
        tableLimit: type === 'table' ? tableLimit : 'all',
        size,
        title,
        note
      });

      widgetTitleInput.value = '';
      widgetNoteInput.value = '';
      renderBuilderCanvas();
      setStatus('Widget added to the student dashboard.', 'success');
    });

    resetWidgetsButton.addEventListener('click', () => {
      builderState.widgets = [];
      renderBuilderCanvas();
      setStatus('Student dashboard cleared.', 'default');
    });

    builderCanvas.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) {
        return;
      }

      const id = Number(button.dataset.id);
      const index = builderState.widgets.findIndex((widget) => widget.id === id);
      if (index === -1) {
        return;
      }

      if (button.dataset.action === 'remove') {
        builderState.widgets.splice(index, 1);
      }

      if (button.dataset.action === 'up' && index > 0) {
        [builderState.widgets[index - 1], builderState.widgets[index]] = [builderState.widgets[index], builderState.widgets[index - 1]];
      }

      if (button.dataset.action === 'down' && index < builderState.widgets.length - 1) {
        [builderState.widgets[index + 1], builderState.widgets[index]] = [builderState.widgets[index], builderState.widgets[index + 1]];
      }

      renderBuilderCanvas();
    });

    syncBuilderControls();
    renderBuilderCanvas();
    renderBuilderPresets();
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

  const upsertChart = (key, target, config) => {
    const canvas = typeof target === 'string' ? document.getElementById(target) : target;
    if (!canvas) {
      return;
    }

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
    builderState.parsedData = parsedData;
    builderState.metrics = metrics;
    updateKpis(metrics);
    renderCharts(parsedData, metrics);
    renderHeroTab(metrics);
    renderNarrative(metrics);
    renderPrediction(metrics);
    renderRawData(parsedData);
    renderBuilderPresets();
    syncBuilderControls();
    renderBuilderCanvas();
    document.getElementById('builder-summary').textContent =
      `Students can now assemble their own dashboard from ${label}: choose a widget type, pick a sheet, and for charts control the X-axis, multiple series columns, aggregation, sorting, row limits, and color style.`;
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
  initializeBuilder();
  loadParsedRows(demoWorkbook, 'the embedded demo dataset');
});
