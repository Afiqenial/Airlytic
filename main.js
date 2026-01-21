// Main JavaScript file for Water Consumption Visualization Dashboard
// Author: Data Visualization Team
// Date: 2025

// Global variables
let waterData = [];
let growthData = [];
let mlResults = {};
let futurePredictions = {};
let currentChart = null;
let selectedStates = [];
let selectedSectors = ['domestic', 'nondomestic'];
let yearRange = [2015, 2024];

// Color palette for consistent styling
const colors = {
    primary: '#1e40af',
    secondary: '#0891b2',
    accent: '#ea580c',
    success: '#059669',
    warning: '#d97706',
    neutral: '#374151',
    background: '#f8fafc'
};

// Chart color palette (maximum 4 colors as per requirements)
const chartColors = ['#1e40af', '#0891b2', '#ea580c', '#059669'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

async function initializeApp() {
    try {
        // Load data
        await loadData();

        // Initialize components
        initializeFilters();
        initializeCharts();
        initializeAnimations();

        // Set up event listeners
        setupEventListeners();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

// Data loading functions
async function loadData() {
    try {
        // Load water consumption data (2015-2024)
        const waterResponse = await fetch('water_consumption_2015_2024.csv');
        const waterCsv = await waterResponse.text();
        waterData = parseCSV(waterCsv);

        // Load growth analysis data
        const growthResponse = await fetch('growth_analysis_2015_2024.csv');
        const growthCsv = await growthResponse.text();
        growthData = parseCSV(growthCsv);

        // Load ML model results
        const mlResponse = await fetch('ml_model_results.json');
        const mlJson = await mlResponse.json();
        mlResults = mlJson;

        // Load future predictions
        const predictionResponse = await fetch('future_predictions.json');
        const predictionJson = await predictionResponse.json();
        futurePredictions = predictionJson;

        console.log('Data loaded successfully');
        console.log('Water data records:', waterData.length);
        console.log('Growth data records:', growthData.length);
        console.log('ML results loaded:', Object.keys(mlResults).length);
        console.log('Future predictions loaded:', Object.keys(futurePredictions).length);
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data
        generateSampleData();
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }

    return data;
}

function generateSampleData() {
    // Generate sample data for demonstration
    const states = ['Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan'];
    const sectors = ['domestic', 'nondomestic'];
    const years = Array.from({ length: 20 }, (_, i) => 2003 + i);

    waterData = [];
    states.forEach(state => {
        sectors.forEach(sector => {
            years.forEach(year => {
                const baseValue = sector === 'domestic' ? 500 : 300;
                const variation = Math.random() * 200 - 100;
                waterData.push({
                    state: state,
                    sector: sector,
                    year: year,
                    value: Math.round(baseValue + variation + (year - 2003) * 10)
                });
            });
        });
    });

    console.log('Sample data generated');
}

// Filter initialization
function initializeFilters() {
    // Initialize state selector
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
        const states = [...new Set(waterData.map(d => d.state))].sort();
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelector.appendChild(option);
        });
    }

    // Initialize sector toggles
    const sectorToggles = document.querySelectorAll('.sector-toggle');
    sectorToggles.forEach(toggle => {
        toggle.addEventListener('change', updateFilters);
    });

    // Initialize year range slider
    initializeYearSlider();
}

function initializeYearSlider() {
    const yearSlider = document.getElementById('yearSlider');
    if (yearSlider) {
        // Simple range slider implementation
        yearSlider.min = 2003;
        yearSlider.max = 2022;
        yearSlider.value = 2003;

        yearSlider.addEventListener('input', function () {
            document.getElementById('yearDisplay').textContent = this.value;
            updateFilters();
        });
    }
}

// Chart initialization and management
function initializeCharts() {
    // Initialize different chart types based on page
    const currentPage = getCurrentPage();

    switch (currentPage) {
        case 'index':
            initializeOverviewCharts();
            break;
        case 'trends':
            initializeTrendCharts();
            break;
        case 'comparison':
            initializeComparisonCharts();
            break;
        case 'insights':
            initializeInsightsCharts();
            break;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('trends')) return 'trends';
    if (path.includes('comparison')) return 'comparison';
    if (path.includes('insights')) return 'insights';
    return 'index';
}

function initializeOverviewCharts() {
    // Time series chart for overview
    createTimeSeriesChart();

    // Statistics cards
    updateStatisticsCards();
}

function createTimeSeriesChart() {
    const chartContainer = document.getElementById('timeSeriesChart');
    if (!chartContainer) return;

    // Process data for time series
    const filteredData = filterData();
    const timeSeriesData = processTimeSeriesData(filteredData);

    // Create ECharts instance
    const chart = echarts.init(chartContainer);

    const option = {
        title: {
            text: 'Water Consumption Trends',
            textStyle: {
                color: colors.neutral,
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: colors.primary,
            borderWidth: 1,
            textStyle: {
                color: colors.neutral
            }
        },
        legend: {
            data: ['Domestic', 'Non-Domestic'],
            textStyle: {
                color: colors.neutral
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeSeriesData.years,
            axisLine: {
                lineStyle: {
                    color: colors.neutral
                }
            }
        },
        yAxis: {
            type: 'value',
            name: 'Consumption (Million Liters)',
            axisLine: {
                lineStyle: {
                    color: colors.neutral
                }
            }
        },
        series: [
            {
                name: 'Domestic',
                type: 'line',
                data: timeSeriesData.domestic,
                smooth: true,
                lineStyle: {
                    color: colors.primary,
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(30, 64, 175, 0.3)' },
                            { offset: 1, color: 'rgba(30, 64, 175, 0.1)' }
                        ]
                    }
                }
            },
            {
                name: 'Non-Domestic',
                type: 'line',
                data: timeSeriesData.nondomestic,
                smooth: true,
                lineStyle: {
                    color: colors.secondary,
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(8, 145, 178, 0.3)' },
                            { offset: 1, color: 'rgba(8, 145, 178, 0.1)' }
                        ]
                    }
                }
            }
        ],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
    };

    chart.setOption(option);
    currentChart = chart;

    // Make chart responsive
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

function processTimeSeriesData(data) {
    const years = [...new Set(data.map(d => d.year))].sort();
    const domesticData = [];
    const nondomesticData = [];

    years.forEach(year => {
        const yearData = data.filter(d => d.year == year);
        const domesticSum = yearData
            .filter(d => d.sector === 'domestic')
            .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
        const nondomesticSum = yearData
            .filter(d => d.sector === 'nondomestic')
            .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);

        domesticData.push(domesticSum);
        nondomesticData.push(nondomesticSum);
    });

    return {
        years: years,
        domestic: domesticData,
        nondomestic: nondomesticData
    };
}

function updateStatisticsCards() {
    const filteredData = filterData();

    // Calculate statistics
    const totalConsumption = filteredData.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
    const avgConsumption = totalConsumption / filteredData.length || 0;
    const maxConsumption = Math.max(...filteredData.map(d => parseFloat(d.value) || 0));
    const minConsumption = Math.min(...filteredData.map(d => parseFloat(d.value) || 0));

    // Update DOM elements with animation
    animateCounter('totalConsumption', Math.round(totalConsumption));
    animateCounter('avgConsumption', Math.round(avgConsumption));
    animateCounter('maxConsumption', Math.round(maxConsumption));
    animateCounter('minConsumption', Math.round(minConsumption));
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentValue = 0;
    const increment = targetValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(currentValue).toLocaleString();
    }, 20);
}

// Animation initialization
function initializeAnimations() {
    // Initialize scroll animations
    initializeScrollAnimations();

    // Initialize typewriter effect
    initializeTypewriter();

    // Initialize particle background
    initializeParticleBackground();
}

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all elements with scroll animation class
    document.querySelectorAll('.scroll-animate').forEach(el => {
        el.style.opacity = '0.9';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initializeTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement && typeof Typed !== 'undefined') {
        new Typed('#typewriter', {
            strings: ['Water Consumption Trends', 'Data-Driven Insights', 'Sustainable Future'],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
}

function initializeParticleBackground() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    // Simple particle system using canvas
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(30, 64, 175, ${particle.opacity})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Event listeners
function setupEventListeners() {
    // State selector change
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
        stateSelector.addEventListener('change', updateFilters);
    }

    // Reset button
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    // Export buttons
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', handleExport);
    });
}

// Filter management
function updateFilters() {
    // Update selected states
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
        selectedStates = Array.from(stateSelector.selectedOptions).map(option => option.value);
    }

    // Update selected sectors
    selectedSectors = [];
    document.querySelectorAll('.sector-toggle:checked').forEach(toggle => {
        selectedSectors.push(toggle.value);
    });

    // Update charts and statistics
    updateCharts();
    updateStatisticsCards();
}

function resetFilters() {
    // Reset state selector
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
        stateSelector.selectedIndex = -1;
    }

    // Reset sector toggles
    document.querySelectorAll('.sector-toggle').forEach(toggle => {
        toggle.checked = true;
    });

    // Reset year slider
    const yearSlider = document.getElementById('yearSlider');
    if (yearSlider) {
        yearSlider.value = 2003;
        document.getElementById('yearDisplay').textContent = '2003';
    }

    // Reset selections
    selectedStates = [];
    selectedSectors = ['domestic', 'nondomestic'];
    yearRange = [2003, 2022];

    // Update displays
    updateFilters();
}

function filterData() {
    return waterData.filter(d => {
        const stateMatch = selectedStates.length === 0 || selectedStates.includes(d.state);
        const sectorMatch = selectedSectors.length === 0 || selectedSectors.includes(d.sector);
        const yearMatch = parseInt(d.year) >= yearRange[0] && parseInt(d.year) <= yearRange[1];

        return stateMatch && sectorMatch && yearMatch;
    });
}

function updateCharts() {
    if (currentChart) {
        const filteredData = filterData();
        const timeSeriesData = processTimeSeriesData(filteredData);

        currentChart.setOption({
            xAxis: {
                data: timeSeriesData.years
            },
            series: [
                {
                    data: timeSeriesData.domestic
                },
                {
                    data: timeSeriesData.nondomestic
                }
            ]
        });
    }
}

// Export functionality
function handleExport(event) {
    const exportType = event.target.dataset.export;

    switch (exportType) {
        case 'csv':
            exportCSV();
            break;
        case 'png':
            exportPNG();
            break;
        case 'pdf':
            exportPDF();
            break;
    }
}

function exportCSV() {
    const filteredData = filterData();
    const csv = convertToCSV(filteredData);
    downloadFile(csv, 'water_consumption_data.csv', 'text/csv');
}

function exportPNG() {
    if (currentChart) {
        const url = currentChart.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
        downloadFile(url, 'water_consumption_chart.png', 'image/png');
    }
}

function exportPDF() {
    // Placeholder for PDF export
    alert('PDF export functionality would be implemented here');
}

function convertToCSV(data) {
    const headers = ['State', 'Sector', 'Year', 'Value'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [row.state, row.sector, row.year, row.value].join(','))
    ].join('\n');

    return csvContent;
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Utility functions
function debounce(func, wait) {
    let tim