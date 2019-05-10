function loadInfo(){
	var info = getInfo()
    var ol_events = $("div.events ol");
    var ol_content = $("div.events-content ol");
    for(let i = 0; i < info.length; i++){
        var strEvent = "<li><a href=\"#0\" data-date=\"31/12/" + info[i].year +"\">"+ info[i].year +"</a><div><p>" + info[i].song + "</p><p>" + info[i].artist + "</p></div></li>";
        //var strContent = "<li data-date=\"31/12/" + info[i].year + "\"><h2>" + info[i].year + "</h2></li>";
	  var strContent ="<li data-date=\"31/12/" + info[i].year + "\">" +
		"<div class=\"year-content\">" +
			"<h2>" + info[i].year + "</h2>" +
			"<div class=\"info\">" +
			"<h3>" + info[i].song + "</h3>" +
			"<h4>" + info[i].artist + "</h4>" +
			"<p>\"Happy\" is a song written, produced, and performed by American singer Pharrell Williams, from the Despicable Me 2soundtrack album. It also served as the lead single from Williams' second studio album, Girl (2014). It was first released on November 21, 2013, alongside a long-form music video. The song was reissued on December 16, 2013, by Back Lot Music under exclusive license to Columbia Records, a division of Sony Music.\"Happy\" is an uptempo soul and neo soulsong on which Williams's falsetto voice has been compared to Curtis Mayfield by critics. The song has been highly successful, peaking at No. 1 in the United States, United Kingdom, Canada, Ireland, New Zealand, and 19 other countries. It was the best-selling song of 2014 in the United States with 6.45 million copies sold for the year, as well as in the United Kingdom with 1.5 million copies sold for the year. It reached No. 1 in the UK on a record-setting three separate occasions and became the most downloaded song of all time in the UK in September 2014; it is the eighth highest-selling single of all time in the country. It was nominated for an Academy Award for Best Original Song. A live rendition of the song won the Grammy Award for Best Pop Solo Performance at the 57th Annual Grammy Awards.</p>" +
			"</div>" +
			"<div class=\"media\">" +
			"<img src=\"../assets/images/" + info[i].year + ".jpg\">" + 
			"<input type=\"button\" class=\"song\" value=\"Play Song\">" + 
			"<input type=\"button\" class=\"video\" value=\"Watch Music Video\">" +
			"</div>" +
		"</div>" +
	"</li>";

        ol_events.append(strEvent);
        ol_content.append(strContent);
    }
}

/*TIMELINE*/
jQuery(document).ready(function($){
	loadInfo();
	
	$('.logo').on('click', function(){
		if($('#container').hasClass('year'))
			$('#container').removeClass('year');
	});

	$('.search-input').on("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			$('.search-icon').click();
		}
	});

	$('.search-icon').on('click',function(){
		var input = $('.search-input');
		var bar = $('.search-bar');

		if(input.is(":invalid")){
			if(!bar.hasClass('invalid')){
				bar.addClass('invalid');
			}	
			else{
				bar.removeClass('invalid');
				void this.clientWidth;
				bar.addClass('invalid');
			}
		}
		else{
			if(bar.hasClass('invalid')){
				bar.removeClass('invalid');
			}
			var year = input.val();
			var a= $("a:contains('" + year +"')");
			a.click();
		}
	});
	
	$('input.song').on('click', function(){
		$('.player').css('visibility', 'visible');
		var year = $('.events-content li.selected .year-content h2').text();
		$('.player').children('img').attr("src", "../assets/images/" + year + ".jpg");
		$('.audio-source').attr("src", "../assets/songs/" + year + ".mp3");
		$('audio')[0].pause();
		$('audio')[0].load();
		$('audio')[0].play();
	});

	////////////
	
	var timelines = $('.cd-horizontal-timeline'),
		eventsMinDistance = 100;

	(timelines.length > 0) && initTimeline(timelines);

	function initTimeline(timelines) {
		timelines.each(function(){
			var timeline = $(this),
				timelineComponents = {};
			//cache timeline components 
			timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
			timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
			timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
			timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
			timelineComponents['timelineEventsDivs'] = timelineComponents['eventsWrapper'].find('li').children('div');
			timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
			timelineComponents['eventsMinLapse'] = minLapse(timelineComponents['timelineDates']);
			timelineComponents['timelineNavigation'] = timeline.find('.timeline-navigation');
			timelineComponents['eventsContent'] = timeline.children('.events-content');

			//assign a left postion to the single events along the timeline
			setDatePosition(timelineComponents, eventsMinDistance);
			//assign a width to the timeline
			var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
			//the timeline has been initialize - show it
			timeline.addClass('loaded');

			//detect click on the next arrow
			timelineComponents['timelineNavigation'].on('click', '.next', function(event){
				event.preventDefault();
				updateSlide(timelineComponents, timelineTotWidth, 'next');
			});
			//detect click on the prev arrow
			timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
				event.preventDefault();
				updateSlide(timelineComponents, timelineTotWidth, 'prev');
			});
			//detect click on the a single event - show new event content
			timelineComponents['eventsWrapper'].on('click', 'a', function(event){
				event.preventDefault();
				if(!$('#container').hasClass('year'))
					$('#container').addClass('year');
				//------
				timelineComponents['timelineEvents'].removeClass('selected');
				$(this).addClass('selected');
				updateOlderEvents($(this));
				updateFilling($(this), timelineComponents['fillingLine'], timelineTotWidth);
				updateVisibleContent($(this), timelineComponents['eventsContent']);
			});

			//on swipe, show next/prev event content
			timelineComponents['eventsContent'].on('swipeleft', function(){
				var mq = checkMQ();
				( mq == 'mobile' ) && showNewContent(timelineComponents, timelineTotWidth, 'next');
			});
			timelineComponents['eventsContent'].on('swiperight', function(){
				var mq = checkMQ();
				( mq == 'mobile' ) && showNewContent(timelineComponents, timelineTotWidth, 'prev');
			});

			//keyboard navigation
			$(document).keyup(function(event){
				if(event.which=='37' && elementInViewport(timeline.get(0)) ) {
					showNewContent(timelineComponents, timelineTotWidth, 'prev');
				} else if( event.which=='39' && elementInViewport(timeline.get(0))) {
					showNewContent(timelineComponents, timelineTotWidth, 'next');
				}
			});
		});
	}

	function updateSlide(timelineComponents, timelineTotWidth, string) {
		//retrieve translateX value of timelineComponents['eventsWrapper']
		var translateValue = getTranslateValue(timelineComponents['eventsWrapper']),
			wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
		//translate the timeline to the left('next')/right('prev') 
		(string == 'next') 
			? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
			: translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);
	}

	function showNewContent(timelineComponents, timelineTotWidth, string) {
		//go from one event to the next/previous one
		var visibleContent =  timelineComponents['eventsContent'].find('.selected'),
			newContent = ( string == 'next' ) ? visibleContent.next() : visibleContent.prev();

		if ( newContent.length > 0 ) { //if there's a next/prev event - show it
			var selectedDate = timelineComponents['eventsWrapper'].find('.selected'),
				newEvent = ( string == 'next' ) ? selectedDate.parent('li').next('li').children('a') : selectedDate.parent('li').prev('li').children('a');
			
			updateFilling(newEvent, timelineComponents['fillingLine'], timelineTotWidth);
			updateVisibleContent(newEvent, timelineComponents['eventsContent']);
			newEvent.addClass('selected');
			selectedDate.removeClass('selected');
			updateOlderEvents(newEvent);
			updateTimelinePosition(string, newEvent, timelineComponents, timelineTotWidth);
		}
	}

	function updateTimelinePosition(string, event, timelineComponents, timelineTotWidth) {
		//translate timeline to the left/right according to the position of the selected event
		var eventStyle = window.getComputedStyle(event.get(0), null),
			eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
			timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
			timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', ''));
		var timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);

        if( (string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < - timelineTranslate) ) {
        	translateTimeline(timelineComponents, - eventLeft + timelineWidth/2, timelineWidth - timelineTotWidth);
        }
	}

	function translateTimeline(timelineComponents, value, totWidth) {
		var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
		value = (value > 0) ? 0 : value; //only negative translate value
		value = ( !(typeof totWidth === 'undefined') &&  value < totWidth ) ? totWidth : value; //do not translate more than timeline width
		setTransformValue(eventsWrapper, 'translateX', value+'px');
		//update navigation arrows visibility
		(value == 0 ) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
		(value == totWidth ) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');
	}

	function updateFilling(selectedEvent, filling, totWidth) {
		//change .filling-line length according to the selected event
		var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
			eventLeft = eventStyle.getPropertyValue("left"),
			eventWidth = eventStyle.getPropertyValue("width");
		eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', ''))/2;
		var scaleValue = eventLeft/totWidth;
		setTransformValue(filling.get(0), 'scaleX', scaleValue);
	}

	function setDatePosition(timelineComponents, min) {
		for (i = 0; i < timelineComponents['timelineDates'].length; i++) { 
		    var distance = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][i]),
				distanceNorm = Math.round(distance/timelineComponents['eventsMinLapse']) + 0.2,
				div = timelineComponents['timelineEventsDivs'].eq(i).outerWidth();
				halfDiv = Math.round(timelineComponents['timelineEventsDivs'].eq(i).width()/2),
				distanceNormDivs = Math.round(distance/timelineComponents['eventsMinLapse']) + 0.4;
			timelineComponents['timelineEvents'].eq(i).css('left', distanceNorm*min+'px');
			timelineComponents['timelineEventsDivs'].eq(i).css('left',distanceNormDivs*min - halfDiv + 'px');
		}
	}

	function setTimelineWidth(timelineComponents, width) {
		var timeSpan = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][timelineComponents['timelineDates'].length-1]),
			timeSpanNorm = timeSpan/timelineComponents['eventsMinLapse'],
			timeSpanNorm = Math.round(timeSpanNorm) + 1,
			totalWidth = timeSpanNorm*width,
			fillWidth = 0;
		timelineComponents['eventsWrapper'].css('width', totalWidth+'px');
		//updateFilling(timelineComponents['timelineEvents'].eq(0), timelineComponents['fillingLine'], totalWidth);
	
		return totalWidth;
	}

	function updateVisibleContent(event, eventsContent) {
		var eventDate = event.data('date'),
			visibleContent = eventsContent.find('.selected'),
			selectedContent = eventsContent.find('[data-date="'+ eventDate +'"]'),
			selectedContentHeight = selectedContent.height();

		if (selectedContent.index() > visibleContent.index()) {
			var classEnetering = 'selected enter-right',
				classLeaving = 'leave-left';
		} else {
			var classEnetering = 'selected enter-left',
				classLeaving = 'leave-right';
		}

		selectedContent.attr('class', classEnetering);
		visibleContent.attr('class', classLeaving).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
			visibleContent.removeClass('leave-right leave-left');
			selectedContent.removeClass('enter-left enter-right');
		});
		eventsContent.css('height', selectedContentHeight+'px');
	}

	function updateOlderEvents(event) {
		event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
	}

	function getTranslateValue(timeline) {
		var timelineStyle = window.getComputedStyle(timeline.get(0), null),
			timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
         		timelineStyle.getPropertyValue("-moz-transform") ||
         		timelineStyle.getPropertyValue("-ms-transform") ||
         		timelineStyle.getPropertyValue("-o-transform") ||
         		timelineStyle.getPropertyValue("transform");

        if( timelineTranslate.indexOf('(') >=0 ) {
        	var timelineTranslate = timelineTranslate.split('(')[1];
    		timelineTranslate = timelineTranslate.split(')')[0];
    		timelineTranslate = timelineTranslate.split(',');
    		var translateValue = timelineTranslate[4];
        } else {
        	var translateValue = 0;
        }

        return Number(translateValue);
	}

	function setTransformValue(element, property, value) {
		element.style["-webkit-transform"] = property+"("+value+")";
		element.style["-moz-transform"] = property+"("+value+")";
		element.style["-ms-transform"] = property+"("+value+")";
		element.style["-o-transform"] = property+"("+value+")";
		element.style["transform"] = property+"("+value+")";
	}

	//based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
	function parseDate(events) {
		var dateArrays = [];
		events.each(function(){
			var dateComp = $(this).data('date').split('/'),
				newDate = new Date(dateComp[2], dateComp[1]-1, dateComp[0]);
			dateArrays.push(newDate);
		});
	    return dateArrays;
	}

	function parseDate2(events) {
		var dateArrays = [];
		events.each(function(){
			var singleDate = $(this),
				dateComp = singleDate.data('date').split('T');
			if( dateComp.length > 1 ) { //both DD/MM/YEAR and time are provided
				var dayComp = dateComp[0].split('/'),
					timeComp = dateComp[1].split(':');
			} else if( dateComp[0].indexOf(':') >=0 ) { //only time is provide
				var dayComp = ["2000", "0", "0"],
					timeComp = dateComp[0].split(':');
			} else { //only DD/MM/YEAR
				var dayComp = dateComp[0].split('/'),
					timeComp = ["0", "0"];
			}
			var	newDate = new Date(dayComp[2], dayComp[1]-1, dayComp[0], timeComp[0], timeComp[1]);
			dateArrays.push(newDate);
		});
	    return dateArrays;
	}

	function daydiff(first, second) {
	    return Math.round((second-first));
	}

	function minLapse(dates) {
		//determine the minimum distance among events
		var dateDistances = [];
		for (i = 1; i < dates.length; i++) { 
		    var distance = daydiff(dates[i-1], dates[i]);
		    dateDistances.push(distance);
		}
		return Math.min.apply(null, dateDistances);
	}

	/*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
	function elementInViewport(el) {
		var top = el.offsetTop;
		var left = el.offsetLeft;
		var width = el.offsetWidth;
		var height = el.offsetHeight;

		while(el.offsetParent) {
		    el = el.offsetParent;
		    top += el.offsetTop;
		    left += el.offsetLeft;
		}

		return (
		    top < (window.pageYOffset + window.innerHeight) &&
		    left < (window.pageXOffset + window.innerWidth) &&
		    (top + height) > window.pageYOffset &&
		    (left + width) > window.pageXOffset
		);
	}

	function checkMQ() {
		//check if mobile or desktop device
		return window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
	}
});

/*DATA BASE*/
function getInfo() {
    var info = [
        {
            year: 1968,
            song: "Hey Jude",
            artist: "The Beatles",
        },
        {
            year: 1969,
            song: "Sugar, Sugar",
            artist: "The Archies",
        },
        {
            year: 1970,
            song: "Bridge over Troubled Water",
            artist: "Simon & Garfunkel",
		},
		{
            year: 1971,
            song: "Joy to the World",
            artist: "Three Dog Night",
		},
		{
            year: 1972,
            song: "The First Time Ever I Saw Your Face",
            artist: "Roberta Flack",
		},
		{
            year: 1973,
            song: "Tie a Yellow Ribbon 'Round the Ole Oak Tree",
            artist: "Tony Orlando and Dawn",
		},
		{
            year: 1974,
            song: "The Way We Were",
            artist: "Barbra Streisand",
		},
		{
            year: 1975,
            song: "Love Will Keep Us Together",
            artist: "Captain & Tennille	",
		},
		{
            year: 1976,
            song: "Silly Love Songs",
            artist: "Wings",
		},
		{
            year: 1977,
            song: "Tonight's the Night (Gonna Be Alright)",
            artist: "Rod Stewart",
		},
		{
            year: 1978,
            song: "Shadow Dancing",
            artist: "Andy Gibb",
		},
		{
            year: 1979,
            song: "My Sharona",
            artist: "The Knack",
		},
		{
            year: 1980,
            song: "Call Me",
            artist: "Blondie",
		},
		{
            year: 1981,
            song: "Bette Davis Eyes",
            artist: "Kim Carnes",
		},
		{
            year: 1982,
            song: "Physical",
            artist: "Olivia Newton-John",
		},
		{
            year: 1983,
            song: "Every Breath You Take",
            artist: "The Police",
		},
		{
            year: 1984,
            song: "When Doves Cry",
            artist: "Prince",
		},
		{
            year: 1985,
            song: "Careless Whisper",
            artist: "Wham!",
		},
		{
            year: 1986,
            song: "That's What Friends Are For",
            artist: "Dionne & Friends",
		},
		{
            year: 1987,
            song: "Walk Like an Egyptian",
            artist: "The Bangles",
		},
		{
            year: 1988,
            song: "Faith",
            artist: "George Michael",
		},
		{
            year: 1989,
            song: "Look Away",
            artist: "Chicago",
		},
		{
            year: 1990,
            song: "Hold On",
            artist: "Wilson Phillips",
		},
		{
            year: 1991,
            song: "(Everything I Do) I Do It for You",
            artist: "Bryan Adams",
		},
		{
            year: 1992,
            song: "End of the Road",
            artist: "Boyz II Men",
		},
		{
            year: 1993,
            song: "I Will Always Love You",
            artist: "Whitney Houston",
		},
		{
            year: 1994,
            song: "The Sign",
            artist: "Ace of Base",
		},
		{
            year: 1995,
            song: "Gangsta's Paradise",
            artist: "Coolio featuring L.V.",
		},
		{
            year: 1996,
            song: "Macarena (Bayside Boys Mix)",
            artist: "Los del Río",
		},
		{
            year: 1997,
            song: "Candle in the Wind",
            artist: "Elton John",
		},
		{
            year: 1998,
            song:"Too Close",
            artist: "Next",
		},
		{
            year: 1999,
            song: "Believe",
            artist: "Cher",
		},
		{
            year: 2000,
            song: "Breathe",
            artist: "Faith Hill",
		},
		{
            year: 2001,
            song: "Hanging by a Moment",
            artist: "Lifehouse",
		},
		{
            year: 2002,
            song: "How You Remind Me",
            artist: "Nickelback",
		},
		{
            year: 2003,
            song: "In da Club",
            artist: "50 Cent",
		},
		{
            year: 2004,
            song: "Yeah!",
            artist: "Usher featuring Lil Jon and Ludacris",
		},
		{
            year: 2005,
            song: "We Belong Together",
            artist: "Mariah Carey",
		},
		{
            year: 2006,
            song: "Bad Day",
            artist: "Daniel Powter",
		},
		{
            year: 2007,
            song: "Irreplaceable",
            artist: "Beyoncé",
		},
		{
            year: 2008,
            song: "Low",
            artist: "Flo Rida featuring T-Pain",
		},
		{
            year: 2009,
            song: "Boom Boom Pow",
            artist: "The Black Eyed Peas",
		},
		{
            year: 2010,
            song: "Tik Tok",
            artist: "Kesha",
		},
		{
            year: 2011,
            song: "Rolling in the Deep",
            artist: "Adele",
		},
		{
            year: 2012,
            song: "Somebody That I Used to Know",
            artist: "Gotye featuring Kimbra",
		},
		{
            year: 2013,
            song: "Thrift Shop",
            artist: "Macklemore & Ryan Lewis featuring Wanz",
		},
		{
            year: 2014,
            song: "Happy",
            artist: "Pharrell Williams",
		},
		{
            year: 2015,
            song: "Uptown Funk",
            artist: "Mark Ronson featuring Bruno Mars",
		},
		{
            year: 2016,
            song: "Love Yourself",
            artist: "Justin Bieber",
		},
		{
            year: 2017,
            song: "Shape of You",
            artist: "Ed Sheeran",
		},
		{
            year: 2018,
            song: "God's Plan",
            artist: "Drake",
		},
    ];

    return info;
}