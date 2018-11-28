$(window).on('beforeunload', function () {
  $(function () {
    $('a[href*=\\#]').on('click', function (e) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: $($(this).attr('href')).offset().top
      }, 600, 'linear');
    });
  });

});

const data = {};
let selectedCity = null;
let cost = 0;

const COLORS = {
  clubEntry: '#30d840',
  drink: '#3ea3db',
  taxi: '#ffe83c',
  bigMac: '#ef4723'
}

const items = ['clubEntry', 'drink', 'taxi', 'bigMac'];

const CHART_PADDING = {
  left: 100,
  right: 20,
  top: 50,
  bottom: 50,
  bar: 4
};

d3.csv('data.csv', d => {
  let city;
  if (!(d.city in data)) {
    data[d.city] = {
      city: d.city,
      country: d.country,
      items: {},
      total: 0
    }
  }
  city = data[d.city];
  switch (d.item) {
    case 'Taxi':
      city.items.taxi = +d.cost;
      break;
    case 'Big Mac':
      city.items.bigMac = +d.cost;
      break;
    case 'Club entry':
      city.items.clubEntry = +d.cost;
      break;
    case 'Longdrink':
      city.items.drink = +d.cost;
      break;
  }
  city.total += +d.cost;
}).then(() => {
  initDropdown();
  // initScroller();
  // initChart();
  // chartAll();
});

function initDropdown() {
  d3.select('#select-city')
    .selectAll('option')
    .data(Object.keys(data))
    .enter()
    .append('option')
    .attr('value', d => data[d].city)
    .text(d => data[d].city + ', ' + data[d].country);

  $(document).on('change', '#select-city', function () {
    setCity(data[d3.select("#select-city").node().value]);
    initScroller();
    initChart();
    $('html, body').animate({
      scrollTop: $('#content').offset().top
    }, 600, 'linear');
  });
}

function initScroller() {
  d3.select('#scrollContainer')
    .style('display', 'block');
  d3.graphScroll()
    .graph(d3.select('#content'))
    .sections(d3.selectAll('#sections > section'))
    .container(d3.select('#scrollContainer'))
    .offset(600)
    .on('active', function (i) {
      if (i > items.length) {
        mergeToFullChart();
      } else if (selectedCity) {
        updateChart(selectedCity, items.slice(0, i));
      }
    });
}

function initChart() {
  const svg = d3.select('#chart');

  const yAxisHeight = 150;

  const height = svg.node().getBoundingClientRect().height - CHART_PADDING.top - CHART_PADDING.bottom;
  const width = svg.node().getBoundingClientRect().width - CHART_PADDING.left - CHART_PADDING.right;

  svg.append('g')
    .attr('class', 'axis axis-y')
    .append('line')
    .attr('class', 'axis-line')
    .attr('stroke', '#ffffff')
    .attr('x1', CHART_PADDING.left)
    .attr('x2', CHART_PADDING.left)
    .attr('y1', CHART_PADDING.top + (height - yAxisHeight) / 2)
    .attr('y2', CHART_PADDING.top + (height + yAxisHeight) / 2);

  svg.append('g')
    .attr('class', 'bars');
}

function setCity(city) {
  selectedCity = city;
  d3.select('#content')
    .select('.city-name')
    .html(city.city);
}

function updateChart(city, items) {
  const svg = d3.select('#chart');
  const height = svg.node().getBoundingClientRect().height - CHART_PADDING.top - CHART_PADDING.bottom;
  const width = svg.node().getBoundingClientRect().width - CHART_PADDING.left - CHART_PADDING.right;

  cost = 0;
  items.forEach(item => cost += city.items[item]);

  const scaleColor = d3.scaleOrdinal()
    .domain(Object.keys(COLORS))
    .range(Object.values(COLORS));

  const stack = d3.stack()
    .keys(items)
    .value((d, key) => d.items[key]);

  const stackedData = stack([city]);

  // bars
  const stackSeries = svg.selectAll('.bars')
    .selectAll('g')
    .data(stackedData, d => d.key);

  let max = Object.values(city.items).reduce((a, b) => a + b, 0);
  // scales
  const scaleX = d3.scaleLinear()
    .domain([0, max])
    .rangeRound([CHART_PADDING.left, width]);

  let t = d3.transition(d3.easeLinear)
    .duration(800)

  stackSeries.exit()
    .remove();

  const bars = stackSeries.enter()
    .append('g')
    .attr('class', 'stack-series')
    .attr('fill', (d, i) => {
      return scaleColor(d.key);
    })
    .merge(stackSeries)
    .attr('transform', (_d, i) => 'translate(' + (i * CHART_PADDING.bar) + ',0)')
    .selectAll('rect')
    .data(d => d);

  bars.exit()
    .remove();

  bars.enter()
    .append('rect')
    // .attr('height', scaleY.bandwidth())
    .attr('height', 50)
    .attr('width', d => scaleX(d[1]) - scaleX(d[0]))
    .attr('y', d => CHART_PADDING.top + height / 2 - 25)
    .attr('x', CHART_PADDING.bar + CHART_PADDING.left + width)
    .merge(bars)
    .transition(t)
    .attr('x', d => {
      return scaleX(d[0]) + CHART_PADDING.bar;
    });

  bars.enter()
    .append('text')
    .attr('class', 'bar-item-label')
    .text((d, i) => {
      return getLegendName(items[items.length - 1]) + ' - $' + (Math.round((d[1] - d[0]) * 100) / 100);
    })
    .attr('y', () => CHART_PADDING.top + height / 2 - 25 + 75)
    // .attr('x', CHART_PADDING.bar + CHART_PADDING.left + width)
    .attr('text-anchor', 'middle')
    .attr('opacity', 0)
    // .merge(bars)
    .transition(t)
    .attr('opacity', 1)
    .attr('x', d => scaleX(d[0]) + CHART_PADDING.bar + (scaleX(d[1]) - scaleX(d[0])) / 2);

  d3.select('#cost-counter')
    .text('Total: $' + (Math.round(cost * 100) / 100));
  // .transition(t)
  // .on("start", function () {
  //   d3.active(this)
  //     .tween("text", function (d) {
  //       let that = d3.select(this);
  //       console.log(d);
  //       let i = d3.interpolateNumber(cost, cost + 50);
  //       return function (t) {
  //         that.text(format(i(t)));
  //       };
  //     });
  // });
}

function mergeToFullChart() {
  const svg = d3.select('#chart');

  const scaleColor = d3.scaleOrdinal()
    .domain(Object.keys(COLORS))
    .range(Object.values(COLORS));

  const height = svg.node().getBoundingClientRect().height - CHART_PADDING.top - CHART_PADDING.bottom;
  const width = svg.node().getBoundingClientRect().width - CHART_PADDING.left - CHART_PADDING.right;

  let selectedLegendItem = null;

  svg.append('g')
    .attr('class', 'axis axis-x');

  const legend = d3.legendColor()
    .scale(scaleColor)
    .labels(d => getLegendName(d))
    .shapeHeight(16)
    .shapeWidth(16)
    .shapePadding(4)
    .labelOffset(4)
    .on('cellclick', legendClick);

  svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + width + ',' + (height / 2) + ')')
    .call(legend)
    .append('text')
    .text('Click to filter')
    .attr('class', 'legend-instruction')
    .attr('transform', 'translate(0, -10)');

  svg.selectAll('.bar-item-label')
    .remove();

  d3.select('#scrollContainer')
    .select('.header')
    .text('Average cost of a night out in selected cities in 2018');

  d3.select('#cost-counter')
    .style('display', 'none');

  update(data, items);

  function update(data, items) {
    const stack = d3.stack()
      .keys(items)
      .value((d, key) => d.items[key]);

    Object.keys(data)
      .forEach(key => {
        data[key]['itemTotal'] = 0;
        items.forEach(item => {
          data[key].itemTotal += data[key].items[item];
        });
      });

    const sortedData = Object.values(data)
      // invert
      .sort((a, b) => a.itemTotal - b.itemTotal);

    const stackedData = stack(sortedData);

    let max = d3.max(sortedData, d => {
      return d.total;
    });

    // scales
    const scaleX = d3.scaleLinear()
      .domain([0, max])
      .rangeRound([CHART_PADDING.left, width]);

    console.log(sortedData.map(d => d.city));

    const scaleY = d3.scaleBand()
      .domain(sortedData.map(d => d.city))
      .rangeRound([height, CHART_PADDING.top])
      .paddingInner(0.3)
      .align(0.3);

    // axes
    const axisX = d3.axisBottom(scaleX)
      .tickSizeOuter(0)
      // .ticks(5)
      .tickFormat((d) => '$' + d);

    const axisY = d3.axisLeft(scaleY)
      .tickSize(0);

    const t = d3.transition()
      .duration(800);

    svg.select('.axis-y')
      .select('.axis-line')
      .transition(t)
      .attr('x1', CHART_PADDING.left)
      .attr('x2', CHART_PADDING.left)
      .attr('y1', CHART_PADDING.top)
      .attr('y2', height)
      .on('end', () => {
        svg.select('.axis-y')
          .select('line')
          .remove();
        svg.select('.axis-x')
          .attr('transform', 'translate(0,' + height + ')')
          .attr('stroke', '#ffffff')
          .transition(t)
          .call(axisX);
        svg.select('.axis-y')
          .append('g')
          .attr('transform', 'translate(' + CHART_PADDING.left + ',0)')
          .attr('stroke', '#ffffff')
          .transition(t)
          .call(axisY);
      });

    if (svg.select('.axis-y').select('.axis-line').empty()) {
      svg.select('.axis-y')
        .transition(t)
        .call(axisY);
    }

    // bars
    const stackSeries = svg.selectAll('.bars')
      .selectAll('g')
      .data(stackedData, d => d.key);

    stackSeries.exit()
      .remove();

    const bars = stackSeries.enter()
      .append('g')
      .attr('class', 'stack-series')
      .attr('fill', (d, i) => scaleColor(d.key))
      .merge(stackSeries)
      .attr('transform', (_d, i) => 'translate(' + (i * CHART_PADDING.bar) + ',0)')
      .selectAll('rect')
      .data(d => d, keyFunc);

    bars.exit().remove();

    bars.transition(t)
      .attr('y', d => {
        return scaleY(d.data.city);
      })
      .attr('height', scaleY.bandwidth())
      .attr('width', d => {
        return scaleX(d[1]) - scaleX(d[0])
      })
      .attr('x', d => {
        return scaleX(d[0]) + CHART_PADDING.bar;
      });

    bars.enter()
      .append('rect')
      .transition(t)
      .attr('y', d => {
        return scaleY(d.data.city);
      })
      .attr('height', scaleY.bandwidth())
      .attr('width', 0)
      .attr('x', CHART_PADDING.bar + CHART_PADDING.left)
      .transition(d3.easeLinear)
      .duration(800)
      .attr('width', d => {
        return scaleX(d[1]) - scaleX(d[0])
      })
      .attr('x', d => {
        return scaleX(d[0]) + CHART_PADDING.bar;
      });

    // bars.enter()
    //   .merge(bars)
    //   .filter(d => Math.abs(d[1] - d.data.itemTotal) < 1)
    //   .append('text')
    //   .attr('class', 'bar-total-label')
    //   .text(d => '$' + (Math.round(d.data.itemTotal * 100) / 100))
    //   .attr('opacity', 0)
    //   .attr('y', d => {
    //     return scaleY(d.data.city) + scaleY.bandwidth() / 2 + 6;
    //   })
    //   .attr('height', scaleY.bandwidth())
    //   .attr('x', d => {
    //     return scaleX(d.data.itemTotal) + CHART_PADDING.bar * 2;
    //   })
    //   .transition(t)
    //   .delay(800)
    //   .duration(800)
    //   .attr('opacity', 0.9);
  }

  function legendClick(item) {
    if (!selectedLegendItem || selectedLegendItem !== item) {
      selectedLegendItem = item;
      update(data, [item]);
    } else {
      selectedLegendItem = null;
      update(data, items);
    }
  }
}

function keyFunc(d) {
  return d.data.city;
}

function getLegendName(d) {
  let name = '';
  if (typeof (d) === 'string') name = d;
  else name = d.domain[d.i];
  switch (name) {
    case 'clubEntry':
      return 'Club entry';
    case 'drink':
      return '2 Longdrinks';
    case 'taxi':
      return 'Taxi';
    case 'bigMac':
      return 'Big Mac';
  }
  return '';
}