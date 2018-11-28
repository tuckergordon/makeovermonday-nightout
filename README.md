# Makeover Monday Week 48: A Night Out

## See the interactive visualization [here](https://tuckergordon.github.io/makeovermonday-nightout/)!

For my first time participating in [Makeover Monday](http://www.makeovermonday.co.uk/) I looked at how I could improve the following visualization from [Thrillist](https://www.thrillist.com/news/nation/cost-of-a-night-out-cities-around-the-world)/[Statista](https://www.statista.com/chart/14081/the-price-of-a-party-around-the-world/):

![https://infographic.statista.com/normal/chartoftheday_14081_the_price_of_a_party_around_the_world_n.jpg](https://infographic.statista.com/normal/chartoftheday_14081_the_price_of_a_party_around_the_world_n.jpg)

I should note that I had to rush through the code on this one in order to complete it in 3 days, so look at the code at your own risk. I'll be doing a massive clean-up and refactor soon.

Anyways, following the guidelines from the folks at Makeover Monday, here was my thought process:

### What works with this chart?
- The stacked bar chart allows for quick comparison of total costs between cities while also giving a sense for the largest contributors to those totals

- All of the labels and titles give you a good sense for what data we're actually dealing with (e.g. *averages* from the year *2018*) without being intrusive or verbose.

### What doesn't work with this chart?
- This chart is definitely suffering from some color clutter. Those flags are adding a ton of activity to the chart without adding much information (e.g. there's only two rows with the same flag). The graphic is fun, but is also distracting, especially since the colors in it don't line up with the corresponding legend colors (the cab is yellow, but why is one of the drinks the Big Mac green color?)

- It's hard to compare the individual items. What if I just want to look at drink prices? It's hard to do here.

- I know this is all based on averages, but it would be nice to customize it to the individual looking at it a bit: which city am I most interested in? How many drinks do I typically have when I go out? It's difficult to do this with a static graphic though, which leads me to....

### How I tried to make it better

#### Personalization via Scroller

![scroller](https://raw.githubusercontent.com/tuckergordon/makeovermonday-nightout/master/screenshots/scroller.png)

I started thinking about this question of personalization: how much would a night in these cities cost *me?* I've been [wanting to build a scroller](http://vallandingham.me/scroller.html) for a while now, and this problem seemed to lend itself very nicely. The user can select a city they're interested in (I wanted to select number of drinks too but ran out of time so I'll be implementing that later) and then the scroller will walk them through how much each item will cost.

#### Clean color scheme
Out with the color clutter and in with a color scheme that I knew worked. I actually pulled it pretty directly from this [beautiful article](https://pudding.cool/2018/11/titletowns/) by Sam Vickars over at the Pudding. Let's keep it clean while giving it a nice dark background (this is nighttime we're talking about, after all).

#### Interactive stacked bar chart
![main_chart](https://raw.githubusercontent.com/tuckergordon/makeovermonday-nightout/master/screenshots/main_chart.png)
That static stacked bar chart from before? I still think it does it's job well, it just needs a little help. So to that, I added a filter for the items that also resorts the bars for easy comparison between items.

### Future Work
As mentioned earlier, I very much consider this a work in progress. Here are some thoughts I have going forward:
- Be able to specify the number of drinks, then individual bars will appear in the stacked bar chart for each one
- Add hover functionality to the chart. This is a no-brainer, I just ran out of time and deprioritized it
- Highlight the selected legend item to make it obvious which one is selected (maybe fade the non-selected ones)
- Improve overall responsiveness and code structure. I want the components used here (e.g. the timeline, the stacked bar chart) to be very reuseable for future projects, so there's definitely some work to be done
- Improve accessibility.
- Put it all in typescript. 
