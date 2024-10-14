import React, { useState, useEffect } from 'react';
import ApexChart from 'react-apexcharts';
import Papa from 'papaparse';
import csvData from './data/hotel_bookings_1000.csv';

const DashboardPanel = () => {
  const [dataset, setDataset] = useState([]);
  const [filteredDataset, setFilteredDataset] = useState([]);
  const [startDate, setStartDate] = useState('2015-01-01');
  const [endDate, setEndDate] = useState('2017-12-31');

  // Load CSV data
  useEffect(() => {
    Papa.parse(csvData, {
      download: true,
      header: true,
      complete: (results) => setDataset(results.data),
      error: (err) => console.error('Error while parsing CSV:', err),
    });
  }, []);

  // Filter data based on date range
  const filterByDate = (data, start, end) => {
    return data.filter(record => {
      if (!record.arrival_date_year || !record.arrival_date_month || !record.arrival_date_day_of_month) return false;
      const recordDate = new Date(`${record.arrival_date_year}-${record.arrival_date_month.padStart(2, '0')}-${record.arrival_date_day_of_month.padStart(2, '0')}`);
      return recordDate >= new Date(start) && recordDate <= new Date(end);
    });
  };

  useEffect(() => {
    if (dataset.length > 0) {
      const filtered = filterByDate(dataset, startDate, endDate);
      setFilteredDataset(filtered);
    }
  }, [startDate, endDate, dataset]);

  return (
    <div className="dashboard-wrapper">
      <SidebarMenu setStartDate={setStartDate} setEndDate={setEndDate} />
      <div className="content-area">
        <h1 className="dashboard-title">Hotel Booking Insights</h1>
        <div className="chart-section">
          <TimeSeriesChart data={filteredDataset} />
          <CountryBarChart data={filteredDataset} />
          <VisitorSparkline data={filteredDataset} category="adults" label="Adult Visitors" />
          <VisitorSparkline data={filteredDataset} category="children" label="Children Visitors" />
        </div>
      </div>
    </div>
  );
};

// Sidebar for Date Range
const SidebarMenu = ({ setStartDate, setEndDate }) => {
  return (
    <div className="sidebar">
      <h2>Date Filter</h2>
      <div className="date-picker">
        <label>Start Date:</label>
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <label>End Date:</label>
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
      </div>
    </div>
  );
};

// Time Series Chart
const TimeSeriesChart = ({ data }) => {
  const chartData = data.map(record => ({
    x: new Date(`${record.arrival_date_year}-${record.arrival_date_month.padStart(2, '0')}-${record.arrival_date_day_of_month.padStart(2, '0')}`),
    y: parseInt(record.adults) + parseInt(record.children) + parseInt(record.babies),
  }));

  const options = {
    chart: { type: 'line', zoom: { enabled: true } },
    xaxis: { type: 'datetime' },
    title: { text: 'Daily Visitors Trend', style: { fontSize: '20px', color: '#333' } },
    colors: ['#1E90FF'],
    theme: { mode: 'light' },
  };

  return <ApexChart options={options} series={[{ name: 'Visitors', data: chartData }]} type="line" height={350} />;
};

// Bar Chart for Country Visitors
const CountryBarChart = ({ data }) => {
  const countryVisitorCount = data.reduce((acc, record) => {
    const totalVisitors = parseInt(record.adults) + parseInt(record.children) + parseInt(record.babies);
    acc[record.country] = (acc[record.country] || 0) + totalVisitors;
    return acc;
  }, {});

  const chartData = Object.keys(countryVisitorCount).map(country => ({
    x: country,
    y: countryVisitorCount[country]
  }));

  const options = {
    chart: { type: 'bar' },
    xaxis: { categories: Object.keys(countryVisitorCount) },
    title: { text: 'Visitors by Country', style: { fontSize: '20px', color: '#333' } },
    colors: ['#FF6347'],
  };

  return <ApexChart options={options} series={[{ name: 'Visitors', data: chartData }]} type="bar" height={350} />;
};

// Sparkline Chart
const VisitorSparkline = ({ data, category, label }) => {
  const visitorCount = data.map(record => parseInt(record[category]));

  const options = {
    chart: { sparkline: { enabled: true } },
    title: { text: `${label}`, align: 'center', style: { fontSize: '16px', color: '#666' } },
    colors: ['#32CD32'],
  };

  const totalVisitors = visitorCount.reduce((sum, count) => sum + count, 0);

  return (
    <div className="sparkline-chart">
      <ApexChart options={options} series={[{ name: label, data: visitorCount }]} type="line" height={100} />
      <div className="total-visitors">Total {label}: {totalVisitors}</div>
    </div>
  );
};

export default DashboardPanel;
