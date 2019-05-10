function loadInfo(){
	var info = getInfo()
    var ol_events = $("div.events ol");
    var ol_content = $("div.events-content ol");
    for(let i = 0; i < info.length; i++){
        var strEvent = "<li><a href=\"#0\" data-date=\"31/12/" + info[i].year +"\">"+ info[i].year +"</a><div><p>" + info[i].song + "</p><p>" + info[i].artist + "</p></div></li>";
        //var strContent = "<li data-date=\"31/12/" + info[i].year + "\"><h2>" + info[i].year + "</h2></li>";
	  var strContent ="<li data-date=\"31/12/" + info[i].year + "\">" +
		"<div class=\"year-content\">" +
			"<h2 class=\"noselect\">" + info[i].year + "</h2>" +
			"<div class=\"info\">" +
			"<h3>" + info[i].song + "</h3>" +
			"<h4>" + info[i].artist + "</h4>" +
			"<p>" + info[i].info1 + "</p>" +
			"<p>" + info[i].info2 + "</p>" +
			"</div>" +
			"<div class=\"media noselect\">" +
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
		info1: "&quot;Hey Jude&quot; is a song by the English rock band the Beatles that was released as a non-album single in August 1968. It was written by Paul McCartney and credited to the Lennon&ndash;McCartney partnership. The single was the Beatles' first release on their Apple record label and one of the &quot;First Four&quot; singles by Apple's roster of artists, marking the label's public launch. &quot;Hey Jude&quot; was a number-one hit in many countries around the world and became the top-selling single of 1968 in the UK, the US, Australia and Canada. Its nine-week run at number one on the Billboard Hot 100 tied the all-time record in 1968 for the longest run at the top of the US charts. It has sold approximately eight million copies and is frequently included on music critics' lists of the greatest songs of all time.",
		info2: "The writing and recording of &quot;Hey Jude&quot; coincided with a period of upheaval in the Beatles. The ballad evolved from &quot;Hey Jules&quot;, a song McCartney wrote to comfort John Lennon's son, Julian, after Lennon had left his wife for the Japanese artist Yoko Ono. The lyrics espouse a positive outlook on a sad situation, while also encouraging &quot;Jude&quot; to pursue his opportunities to find love. After the fourth verse, the song shifts to a wordless, fade-out coda that lasts for over four minutes. Recording for the song took place midway through the sessions for the Beatles' self-titled double album (also known as the &quot;White Album&quot;) and led to an argument between McCartney and George Harrison over Harrison's idea for the guitar part. Ringo Starr later left the band only to return shortly before they filmed the promotional clip for the single. The clip was directed by Michael Lindsay-Hogg and first aired on David Frost's UK television show. Contrasting with the problems afflicting the band, this performance captured the song's theme of optimism and togetherness by featuring the studio audience joining the Beatles as they sang the coda."
        },
        {
            year: 1969,
            song: "Sugar, Sugar",
		artist: "The Archies",
		info1: "&quot;Sugar, Sugar&quot; is a song written by Jeff Barry and Andy Kim. It was originally recorded by the virtual band the Archies. This version reached number one in the US on the Billboard Hot 100 chart in 1969 and remained there for four weeks. It was also number one on the UK Singles chart in that same year for eight weeks. The song became a hit again in 1970 when rhythm and blues and soul singer Wilson Pickett took it back onto the charts.",
		info2: "",
        },
        {
            year: 1970,
            song: "Bridge over Troubled Water",
		artist: "Simon & Garfunkel",
		info1: "&quot;Bridge over Troubled Water&quot; is a song by American music duo Simon &amp; Garfunkel. Produced by the duo and Roy Halee, the song was released as the follow-up single to &quot;The Boxer&quot; in January 1970. The song is featured on their fifth studio album, Bridge over Troubled Water (1970). Composed by singer-songwriter Paul Simon, the song is performed on piano and carries the influence of gospel music. The original studio recording employs elements of Phil Spector's &quot;Wall of Sound&quot; technique using L.A. session musicians from the Wrecking Crew.",
		info2: "It was the last song recorded for their fifth and final album, but the first fully completed.The song's instrumentation was recorded in California while the duo's vocals were cut in New York.Simon felt his partner, Art Garfunkel, should sing the song solo, an invitation Garfunkel initially declined but later accepted.Session musician Larry Knechtel performs piano on the song, with Joe Osborn playing bass guitar and Hal Blaine closing out the song with drums. The song won five awards at the 13th Annual Grammy Awards in 1971, including Grammy Award for Record of the Year and Song of the Year."
		},
		{
            year: 1971,
            song: "Joy to the World",
		artist: "Three Dog Night",
		info1: "&quot;Joy to the World&quot; is a song written by Hoyt Axton and made famous by the band Three Dog Night. The song is also popularly known by its opening lyric, &quot;Jeremiah was a bullfrog.&quot; Three Dog Night originally released the song on their fourth studio album, Naturally, in November 1970, and subsequently released an edited version of the song as a single in February 1971.",
		info2: "The song, which has been described by members of Three Dog Night as a &quot;kid's song&quot; and a &quot;silly song,&quot;topped the singles charts in North America, was certified gold by the RIAA, and has since been covered by multiple artists."
		},
		{
            year: 1972,
            song: "The First Time Ever I Saw Your Face",
		artist: "Roberta Flack",
		info1: "&quot;The First Time Ever I Saw Your Face&quot; is a 1957 folk song written by British political singer/songwriter Ewan MacColl for Peggy Seeger, who later became his wife. At the time, the couple were lovers, although MacColl was still married to Joan Littlewood. Seeger sang the song when the duo performed in folk clubs around Britain. During the 1960s, it was recorded by various folk singers and became a major international hit for Roberta Flack in 1972, winning Grammy Awards for Record of the Year and Song of the Year. Billboard ranked it as the number one Hot 100 single of the year for 1972.",
		info2: ""
		},
		{
            year: 1973,
            song: "Tie a Yellow Ribbon 'Round the Ole Oak Tree",
		artist: "Tony Orlando and Dawn",
		info1: "&quot;Tie a Yellow Ribbon Round the Ole Oak Tree&quot; is a song by Tony Orlando and Dawn. It was written by Irwin Levine and L. Russell Brown and produced by Hank Medress and Dave Appell, with Motown/Stax backing vocalist Telma Hopkins, Joyce Vincent Wilson and her sister Pamela Vincent on backing vocals.It was a worldwide hit for the group in 1973.",
		info2: "The single reached the top 10 in ten countries, in eight of which it topped the charts. It reached number one on both the US and UK charts for four weeks in April 1973, number one on the Australian charts for seven weeks from May to July 1973 and number one on the New Zealand charts for ten weeks from June to August 1973. It was the top-selling single in 1973 in both the US and UK."
		},
		{
            year: 1974,
            song: "The Way We Were",
		artist: "Barbra Streisand",
		info1: "&quot;The Way We Were&quot; is a song recorded by American vocalist Barbra Streisand for her fifteenth studio album, The Way We Were (1974). It was physically released as the record's lead single on September 27, 1973 through Columbia Records. The 7&quot; single was distributed in two different formats, with the standard edition featuring B-side track &quot;What Are You Doing the Rest of Your Life?&quot; and the Mexico release including an instrumental B-side instead. The recording was written by Alan Bergman, Marilyn Bergman and Marvin Hamlisch, while production was solely handled by Marty Paich. &quot;The Way We Were&quot; was specifically produced for the record, in addition to three other tracks, including her then-upcoming single &quot;All in Love Is Fair&quot; (1974).",
		info2: "Its lyrics detail the melancholic relationship between the two main characters in the 1973 film of the same name. Its appeal was noted by several music critics, who felt its impact helped revive Streisand's career. It also won two Academy Awards, which were credited to the songwriters of the track. The single was also a commercial success, topping the charts in both Canada and the United States, while peaking in the top 40 in Australia and the United Kingdom. Additionally, &quot;The Way We Were&quot; was 1974's most successful recording in the United States, where it was placed at number one on the Billboard Year-End Hot 100 singles list. It has since been certified Platinum by the RIAA for sales of over one million units. Streisand has also included &quot;The Way We Were&quot; on various compilation albums, with it most recently appearing on 2010's Barbra: The Ultimate Collection."
		},
		{
            year: 1975,
            song: "Love Will Keep Us Together",
		artist: "Captain & Tennille	",
		info1: "&quot;Love Will Keep Us Together&quot; is a song written by Neil Sedaka and Howard Greenfield. It was first recorded by Sedaka in 1973 and was released as a single in France. American pop duo Captain &amp; Tennille covered the song in 1975, with instrumental backing almost entirely by &ldquo;Captain&rdquo; Daryl Dragon, with the exception of drums played by the Wrecking Crew drummer Hal Blaine; their version became a worldwide hit.",
		info2: ""
		},
		{
            year: 1976,
            song: "Silly Love Songs",
		artist: "Wings",
		info1: "&quot;Silly Love Songs&quot; is a song written by Paul McCartney and Linda McCartney and performed by Wings. The song appears on the 1976 album Wings at the Speed of Sound. It was also released as a single in 1976, backed with &quot;Cook of the House&quot;. The song, written in response to music critics accusing McCartney of predominantly writing &quot;silly love songs&quot; and &quot;sentimental slush&quot;, also features disco overtones",
		info2: "The song was Paul McCartney's 27th number one as a songwriter; the all-time record for the most number one hits achieved by a songwriter.[n 1] With this song, McCartney became the first person to have a year-end No. 1 song as a member of two distinct acts. He having previously hit No. 1 in the year-end Billboard chart with &quot;I Want to Hold Your Hand&quot; in 1964 and &quot;Hey Jude&quot; in 1968."
		},
		{
            year: 1977,
            song: "Tonight's the Night (Gonna Be Alright)",
		artist: "Rod Stewart",
		info1: "&quot;Tonight's the Night (Gonna Be Alright)&quot; is a song written by Rod Stewart, and recorded at Muscle Shoals Sound Studio in Sheffield, Alabama for his 1976 album A Night on the Town. The song proved to be a massive commercial success and became his second US chart topper on the Billboard Hot 100. It made its debut at number 81 on October 2, 1976 and rose quickly, climbing from number eight to the top of the chart on November 13, 1976, and remained on top for eight consecutive weeks until January 8, 1977. It was the longest stay of any song during 1976, as well as the longest stay at number one for Rod Stewart in his entire recording career. The song also peaked at No. 5 in the UK, No. 3 in Australia and charted well in other parts of the world. It was the number 1 song on Billboard's 1977 year-end chart. It became the best-selling single of 1977 in the United States. As of 2018, it is the nineteenth most popular song in the history of the chart.s",
		info2: ""
		},
		{
            year: 1978,
            song: "Shadow Dancing",
		artist: "Andy Gibb",
		info1: "&quot;Shadow Dancing&quot; is a disco song performed by English singer-songwriter Andy Gibb that reached number one for seven weeks on the Billboard Hot 100 in 1978. Albhy Galuten (who also produced this song) arranged the song with Barry Gibb. While Andy Gibb would have three more Top 10 hits in the U.S., this would be his final chart-topping hit in America. The song became a platinum record.",
		info2: ""
		},
		{
            year: 1979,
            song: "My Sharona",
		artist: "The Knack",
		info1: "&quot;My Sharona&quot; is the debut single by the Knack. The song was written by Berton Averre and Doug Fieger, and released in 1979 from their album Get the Knack. It reached number one on the Billboard Hot 100 singles chart where it remained for 6 weeks, and was number one on Billboard's 1979 Top Pop Singles year-end chart.",
		info2: "It was certified gold by the Recording Industry Association of America, representing one million copies sold, and was Capitol Records' fastest gold status debut single since the Beatles' &quot;I Want to Hold Your Hand&quot; in 1964."
		},
		{
            year: 1980,
            song: "Call Me",
		artist: "Blondie",
		info1: "&quot;Call Me&quot; is a song by the American new wave band Blondie and the theme to the 1980 film American Gigolo. Released in the US in early 1980 as a single, &quot;Call Me&quot; was number one for six consecutive weeks on the Billboard Hot 100 chart, where it became the band's biggest single and second No. 1. It also hit No. 1 in the UK and Canada, where it became their fourth and second chart-topper, respectively. In the year-end chart of 1980, it was Billboard's No. 1 single and RPM magazine's No. 3 in Canada.",
		info2: ""
		},
		{
            year: 1981,
            song: "Bette Davis Eyes",
		artist: "Kim Carnes",
		info1: "&quot;Bette Davis Eyes&quot; is a song written and composed by Donna Weiss and Jackie DeShannon, and made popular by American singer Kim Carnes. DeShannon recorded it in 1974; Carnes's 1981 version spent nine weeks at No. 1 on the Billboard Hot 100 and was Billboard's biggest hit of 1981.",
		info2: ""
		},
		{
            year: 1982,
            song: "Physical",
		artist: "Olivia Newton-John",
		info1: "&quot;Physical&quot; is a song by British-born Australian singer Olivia Newton-John for her twelfth studio album Physical. It was released in September 1981 by MCA Records as the lead single from the album. The song was written by Steve Kipner and Terry Shaddick, who had originally intended to offer it to British singer-songwriter Rod Stewart, and produced by John Farrar. The song had also been offered to Tina Turner by her manager Roger Davies, but when Turner declined, Davies gave the song to Newton-John, another of his clients.",
		info2: "The song was an immediate success, shipping two million copies in the United States, where it was certified Platinum and spent 10 weeks at #1 on the Billboard Hot 100. &quot;Physical&quot; ultimately became Newton-John's biggest American hit and cemented her legacy as a pop superstar, a journey that began when she crossed over from her earlier country-pop roots. The song's suggestive lyrics, which even caused it to be banned in some markets, helped change Newton-John's longstanding clean-cut image, replacing it with a sexy, assertive persona that was strengthened with follow-up hits such as &quot;Make A Move On Me&quot;, &quot;Twist of Fate&quot; and &quot;Soul Kiss&quot;. The song's guitar solo was performed by Steve Lukather."
		},
		{
            year: 1983,
            song: "Every Breath You Take",
		artist: "The Police",
		info1: "&quot;Every Breath You Take&quot; is a song by the English rock band the Police from their album Synchronicity (1983). Written by Sting, the single was the biggest US and UK hit of 1983, topping the Billboard Hot 100 singles chart for eight weeks (the band's only &thinsp;No.&thinsp;1 hit on that chart), and the UK Singles Chart for four weeks. It also topped the Billboard Top Tracks chart for nine weeks.",
		info2: "At the 26th Annual Grammy Awards the song was nominated for three Grammy Awards, including Song of the Year, Best Pop Performance by a Duo or Group with Vocals, and Record of the Year, winning in the first two categories. For the song, Sting received the 1983 British Academy's Ivor Novello award for Best Song Musically and Lyrically."
		},
		{
            year: 1984,
            song: "When Doves Cry",
		artist: "Prince",
		info1: "&quot;When Doves Cry&quot; is a song by American musician Prince, and the lead single from his 1984 album Purple Rain. It was a worldwide hit, and his first American number one single, topping the charts for five weeks. According to Billboard magazine, it was the top-selling single of the year. It was certified platinum by the Recording Industry Association of America, shipping two million units in the United States.It was the last single released by a solo artist to receive such certification before the certification requirements were lowered in 1989.",
		info2: "The song ranked number 52 on the Rolling Stone list of the 500 Greatest Songs of All Time and is included in The Rock and Roll Hall of Fame's 500 Songs that Shaped Rock and Roll."
		},
		{
            year: 1985,
            song: "Careless Whisper",
		artist: "Wham!",
		info1: "&quot;Careless Whisper&quot; is a pop ballad by English singer-songwriter George Michael (sometimes credited to &quot;Wham! featuring George Michael&quot; in Japan, Canada and the United States). It was released on 24 July 1984, by Epic Records in the United Kingdom, Japan and other countries, and by Columbia Records in North America. The song was released while Michael was still performing as a member of Wham! and is included on the Wham! album, Make it Big.",
		info2: "The song features a prominent saxophone riff, and has been covered by a number of artists since its first release. It was released as a single and became a huge commercial success on both sides of the Atlantic and on both sides of the Pacific. It reached number one in nearly 25 countries, selling about 6 million copies worldwide&mdash;2 million of them in the United States."
		},
		{
            year: 1986,
            song: "That's What Friends Are For",
		artist: "Dionne & Friends",
		info1: "&quot;That's What Friends Are For&quot; is a song written by Burt Bacharach and Carole Bayer Sager. It was first recorded in 1982 by Rod Stewart for the soundtrack of the film Night Shift, but it is better known for the 1985 cover version by Dionne Warwick, Elton John, Gladys Knight, and Stevie Wonder. This recording, billed as being by &quot;Dionne &amp; Friends&quot;, was released as a charity single for AIDS research and prevention. It was a massive hit, becoming the number-one single of 1986 in the United States, and winning the Grammy Awards for Best Pop Performance by a Duo or Group with Vocals and Song of the Year. It raised over $3 million for its cause.",
		info2: ""
		},
		{
            year: 1987,
            song: "Walk Like an Egyptian",
		artist: "The Bangles",
		info1: "&quot;Walk Like an Egyptian&quot; is a song recorded by the American band the Bangles. It was released in 1986 as the third single from the album Different Light. It was a million-selling single and became Billboard's number-one song of 1987.",
		info2: ""
		},
		{
            year: 1988,
            song: "Faith",
		artist: "George Michael",
		info1: "&quot;Faith&quot; is a song written and performed by George Michael, from his 1987 debut solo album of the same name.",
		info2: "It held the number one position on Billboard Hot 100 chart for four weeks and, according to Billboard magazine, it was the number one single of the year in the United States in 1988. The song also reached number one in Australia and Canada and number two on the UK Singles Chart. In 2001 it placed at number 322 on the Songs of the Century list."
		},
		{
            year: 1989,
            song: "Look Away",
		artist: "Chicago",
		info1: "&quot;Look Away&quot; is a 1988 power ballad by American rock band Chicago. Written by Diane Warren, produced by Ron Nevison, and with Bill Champlin on lead vocals, it is the second single from the band's album Chicago 19. &quot;Look Away&quot; is Chicago's largest selling single of all, topping the Billboard Hot 100 for two weeks in December 1988, matching the chart success of the group's &quot;If You Leave Me Now&quot; (1976) and &quot;Hard to Say I'm Sorry&quot; (1982). &quot;Look Away&quot; is Chicago's seventh song to have peaked at No. 1 on the Adult Contemporary chart as well as the No. 1 song on the 1989 year-end Billboard Hot 100 chart, even though it never held the No. 1 spot at all in 1989.",
		info2: "The song, unlike hits from early in Chicago's career, does not prominently feature horns. It is also the band's only No. 1 single following the 1985 departure of Peter Cetera."
		},
		{
            year: 1990,
            song: "Hold On",
		artist: "Wilson Phillips",
		info1: "&quot;Hold On&quot; is a song recorded by American vocal group Wilson Phillips. It was released on February 27, 1990 as the lead single from their debut studio album, Wilson Phillips (1990).",
		info2: "The song won the Billboard Music Award for Hot 100 Single of the Year for 1990. At the Grammy Awards of 1991, the song received a nomination for Song of the Year, losing to &quot;From a Distance&quot; by Julie Gold and performed by Bette Midler. Kids Incorporated covered &quot;Hold On&quot; in 1991 in the Season 7 episode &quot;That's What Friends Are For&quot;."
		},
		{
            year: 1991,
            song: "(Everything I Do) I Do It for You",
		artist: "Bryan Adams",
		info1: "&quot;(Everything I Do) I Do It for You&quot; is a song by Canadian singer-songwriter Bryan Adams. Written by Adams, Michael Kamen and Robert John &quot;Mutt&quot; Lange, featured on two albums simultaneously on its release, the soundtrack album from the 1991 film Robin Hood: Prince of Thieves and on Adams' sixth album Waking Up the Neighbours (1991). The song was an enormous chart success internationally reaching the number one position on the music charts of at least sixteen countries. It was particularly successful in the United Kingdom, where it spent sixteen consecutive weeks at number one on the UK Singles Chart (the longest run of its kind in British chart history behind Frankie Laine's &quot;I Believe&quot;). It went on to sell more than 15 million copies worldwide, making it Adams' most successful song and one of the best-selling singles of all time. Subsequently, the song has been covered by hundreds of singers and artists around the world.",
		info2: ""
		},
		{
            year: 1992,
            song: "End of the Road",
		artist: "Boyz II Men",
		info1: "&quot;End of the Road&quot; is a single recorded by American R&amp;B group Boyz II Men for the Boomerang soundtrack. It was released in 1992 and written and produced by Kenneth &quot;Babyface&quot; Edmonds, L.A. Reid and Daryl Simmons.",
		info2: "&quot;End of the Road&quot; achieved overwhelming domestic and international success and is considered one of the most successful songs of all time. In the United States, &quot;End of the Road&quot; spent a then record breaking 13 weeks at number one on the US Billboard Hot 100, a record broken later in the year by Whitney Houston's 14-week number one hit &quot;I Will Always Love You&quot;; Boyz II Men would later match Houston's record with &quot;I'll Make Love to You&quot;, which spent 14 weeks at number one in 1994, and then reclaim the record with &quot;One Sweet Day&quot; (a duet with Mariah Carey), which spent 16 weeks at number one from 1995 to 1996."
		},
		{
            year: 1993,
            song: "I Will Always Love You",
		artist: "Whitney Houston",
		info1: "&quot;I Will Always Love You&quot; is a song originally written and recorded in 1973 by American singer-songwriter Dolly Parton.Her country version of the track was released in 1974 as a single and was written as a farewell to her one-time partner and mentor of seven years, Porter Wagoner, following Parton's decision to pursue a solo career.",
		info2: "In 1992, R&amp;B singer Whitney Houston recorded a new arrangement of &quot;I Will Always Love You&quot; for the soundtrack to The Bodyguard, her film debut. The song has a saxophone solo by Kirk Whalum. She was originally to record Jimmy Ruffin's &quot;What Becomes of the Brokenhearted&quot; as the lead single from The Bodyguard. However, when it was discovered the song was to be used for Fried Green Tomatoes, Houston requested a different song. It was her co-star Kevin Costner who suggested &quot;I Will Always Love You&quot;, playing her Linda Ronstadt's 1975 version from her album Prisoner in Disguise. Producer David Foster re-arranged the song as a soul ballad. Her record company did not feel a song with an a cappella introduction would be as successful; however, Houston and Costner insisted on retaining it. When Parton heard that Houston was using Ronstadt's recording as a template, she called Foster to give him the final verse, which was missing from the Ronstadt recording, as she felt it was important to the song."
		},
		{
            year: 1994,
            song: "The Sign",
		artist: "Ace of Base",
		info1: "&quot;The Sign&quot; is a song by the Swedish band Ace of Base, which was released on 29 October 1993 in Europe. It was an international hit, reaching number two in the United Kingdom and spending six non-consecutive weeks at number one on the Billboard Hot 100 chart in the United States. More prominently, it became the top song on Billboard's 1994 Year End Chart. It appeared on the band's album Happy Nation (titled The Sign in North America).",
		info2: ""
		},
		{
            year: 1995,
            song: "Gangsta's Paradise",
		artist: "Coolio featuring L.V.",
		info1: "&quot;Gangsta's Paradise&quot; is a song by American rapper Coolio, featuring singer L.V. The song was released on Coolio's album of the same name, as well as the soundtrack for the 1995 film Dangerous Minds. It samples the chorus and instrumentation of Stevie Wonder's 1976 song &quot;Pastime Paradise&quot;.",
		info2: "The song was listed at number 85 on Billboard's Greatest Songs of All-Time and number one biggest selling single of 1995 on U.S. Billboard. In 2008, it was ranked number 38 on VH1's 100 Greatest Songs of Hip Hop.Coolio was awarded a Grammy for Best Rap Solo Performance, two MTV Video Music Award's for Best Rap Video and for Best Video from a Film and a Billboard Music Award for the song/album. The song was voted as the best single of the year in The Village Voice Pazz &amp; Jop critics poll."
		},
		{
            year: 1996,
            song: "Macarena (Bayside Boys Mix)",
		artist: "Los del Río",
		info1: "&quot;Macarena&quot; (Spanish pronunciation: [makaˈɾena]) is a Spanish dance song by Los del R&iacute;o about a woman who cheats on her boyfriend while he is being drafted into the army. Appearing on the 1993 album A m&iacute; me gusta, it was an international hit in 1995, 1996, and 1997, and continues to be a popular dance at weddings, parties, and sporting events. One of the most iconic examples of 1990s dance music, it was ranked the &quot;#1 Greatest One-Hit Wonder of All Time&quot; by VH1 in 2002. The song uses a type of clave rhythm. In 2012, it was ranked as the No. 7 on Billboard's All Time Top 100. It also ranked at No. 1 on Billboard's All Time Latin Songs. It is also Billboard's No. 1 dance song and one of six foreign language songs to hit No. 1 since 1995's rock era began.",
		info2: ""
		},
		{
            year: 1997,
            song: "Candle in the Wind",
		artist: "Elton John",
		info1: "&quot;Candle in the Wind 1997&quot; is a song by Bernie Taupin and Elton John, a re-written and re-recorded version of their 1974 song &quot;Candle in the Wind&quot;. It was released on 13 September 1997 as a tribute single to Diana, Princess of Wales, with the global proceeds from the song going towards Diana's charities. In many countries, it was pressed as a double A-side with &quot;Something About the Way You Look Tonight&quot;. The lyrics were written by Bernie Taupin, and the song produced by Sir George Martin.",
		info2: "According to the Guinness Book of Records, &quot;Candle in the Wind 1997&quot; is the second highest selling single of all time (behind Bing Crosby's &quot;White Christmas&quot; from 1942), and is the highest-selling single since charts began in the 1950s."
		},
		{
            year: 1998,
            song:"Too Close",
		artist: "Next",
		info1: "&quot;Too Close&quot; is a song by American R&amp;B group Next, featuring uncredited vocals from Vee of Koffee Brown. It was released in September 1997 as the second single from their debut album Rated Next (1997).",
		info2: "The song reached number one on the US Hot 100 and R&amp;B charts and has gone Platinum making it their biggest and best known hit. In the 1998 US Billboard End-Year chart, the song reached number one. It contains a sample of &quot;Christmas Rappin'&quot; by Kurtis Blow. &quot;Too Close&quot; was a massive hit on Urban Contemporary radio stations by its fourth month of airplay in January 1998 and still the most played single by Next."
		},
		{
            year: 1999,
            song: "Believe",
		artist: "Cher",
		info1: "&quot;Believe&quot; is a song recorded by the American singer Cher for her twenty-second album, Believe (1998), released by Warner Bros. Records. It was released as the lead single from the album on October 19, 1998. It was written by Brian Higgins, Stuart McLennen, Paul Barry, Steven Torch, Matthew Gray and Timothy Powell, with Cher also contributing, and was produced by Mark Taylor and Brian Rawling.",
		info2: "&quot;Believe&quot; departed from Cher's pop rock style of the time for an upbeat dance-pop style. It featured a pioneering use of the audio processing software Auto-Tune to create a deliberate vocal distortion, which became known as the &quot;Cher effect&quot;. The lyrics describe empowerment and self-sufficiency after a painful breakup."
		},
		{
            year: 2000,
            song: "Breathe",
		artist: "Faith Hill",
		info1: "&quot;Breathe&quot; is a song written by Stephanie Bentley and Holly Lamar and recorded by American country music artist Faith Hill. It was released in October 1999 as the first single from her fourth album of the same name. &quot;Breathe&quot; became Hill's seventh number one on the Hot Country Songs chart in the US. The song spent six weeks at number one on the Billboard Hot Country Songs chart in December 1999 and January 2000. It also peaked at number 2 on the Billboard Hot 100 chart in April 2000. Despite not peaking at number one, it was the number one single of 2000, becoming only the second single at the time to top the year end charts despite never spending a week at the top of the weekly charts and marking the first time this had happened in 35 years.",
		info2: ""
		},
		{
            year: 2001,
            song: "Hanging by a Moment",
		artist: "Lifehouse",
		info1: "&quot;Hanging by a Moment&quot; is a song by American alternative rock band Lifehouse. It was the first single released from their debut studio album, No Name Face (2000), issued through DreamWorks Records. The track was written by lead singer Jason Wade, who said that he wrote the song in about five minutes without thinking about what would happen to it. It was produced by American record producer Ron Aniello and was mixed by Brendan O'Brien. Musically, &quot;Hanging by a Moment&quot; is a post-grunge song that contains influences of alternative rock.",
		info2: "The song was first released to US radio stations in October 2000, rising slowly on the charts. It peaked at number two on the Billboard Hot 100 and is the band's most successful single to date on the chart. Despite not peaking at number one, it was the number one single of 2001, becoming only the third (and currently last) single to top the year-end charts despite never spending a week at the top of the weekly charts. It followed &quot;Breathe&quot; from the previous year in completing this feat, marking the second consecutive year this feat had been accomplished after not happening for 35 years prior to 2000."
		},
		{
            year: 2002,
            song: "How You Remind Me",
		artist: "Nickelback",
		info1: "&quot;How You Remind Me&quot; is a song by Canadian rock band Nickelback. It was released on August 21, 2001 as the lead single from their third studio album Silver Side Up (2001). A &quot;Gold Mix&quot; was made for latter editions of the single with the heavier guitars edited out of the chorus. Lead vocalist and guitarist Chad Kroeger wrote the song about his old girlfriend Jodi, with whom he had a dysfunctional relationship. He referred to this song as the song that put Nickelback on the map when played at their concert in Sturgis, South Dakota, and is often considered to be their signature song.",
		info2: "&quot;How You Remind Me&quot; was named the number one most played song on U.S. radio of the 2000s decade by Nielsen Soundscan, being spun over 1.2 million times on U.S. airwaves since its release in 2001 to the end of 2009. The song was named fourth on the Billboard Hot 100 Songs of the Decade and 75th in the UK decade-end chart. It was nominated for the Kerrang! Award for Best Single. &quot;How You Remind Me&quot; was also rated the number one rock song and number 4 alternative song of the decade of the 2000s by Billboard. The song was featured in the music video game Guitar Hero: Warriors of Rock and in a recut, PG-13 version of Deadpool 2 titled Once Upon a Deadpool. The song played a large role in a Saturday Night Live skit on March 10, 2018 with Sterling K. Brown in which the lyrics are a dying woman's final words."
		},
		{
            year: 2003,
            song: "In da Club",
		artist: "50 Cent",
		info1: "&quot;In da Club&quot; is a song by American rapper 50 Cent from his debut studio album Get Rich or Die Tryin' (2003). The track was written by 50 Cent, Dr. Dre and Mike Elizondo, and produced by Dr. Dre with co-production credit from Elizondo. The song was released in January 2003 as the album's lead single and peaked at number one on the US Billboard Hot 100, becoming 50 Cent's first number-one single on that chart.",
		info2: "&quot;In da Club&quot; received praise from critics; at the 46th Grammy Awards, it was nominated for Best Male Rap Solo Performance and Best Rap Song. The accompanying music video for &quot;In da Club&quot; won Best Rap Video and Best New Artist at the 2003 MTV Video Music Awards. In 2009, the song was listed at number 24 in Billboard's Hot 100 Songs of the Decade. It was listed at number 13 in Rolling Stone's &quot;Best Songs of the Decade&quot;. In 2010, it was ranked 448th in Rolling Stone's 500 Greatest Songs of All Time list."
		},
		{
            year: 2004,
            song: "Yeah!",
		artist: "Usher featuring Lil Jon and Ludacris",
		info1: "&quot;Yeah!&quot; is a song by American singer Usher. The song is co-written by Sean Garrett, Patrick J. Que Smith, Robert McDowell, LRoc, Ludacris, and Lil Jon. It also features guest vocals from Lil Jon and Ludacris, with the former also producing the song as well as incorporating crunk and R&amp;B&mdash;which he coined as crunk&amp;B&mdash;in the song's production. The song was released as the lead single from Usher's fourth studio album Confessions (2004) on January 27, 2004, after Usher was told by Arista Records, his label at the time, to record more tracks for the album.",
		info2: "&quot;Yeah!&quot; topped the US Billboard Hot 100 chart for 12 consecutive weeks, before being dethroned by Usher's follow-up single &quot;Burn&quot;. &quot;Yeah!&quot; was the longest-running number one single in 2004, subsequently topping the year-end chart on the Hot 100. It was certified platinum by the Recording Industry Association of America (RIAA). The song received a similar response in other countries, topping in other twelve charts worldwide. It was certified platinum in several countries, including Australia, Belgium, Canada, Germany and Norway, and received a two times platinum certification in New Zealand. The song peaked in the top-ten in several Year-end charts."
		},
		{
            year: 2005,
            song: "We Belong Together",
		artist: "Mariah Carey",
		info1: "&quot;We Belong Together&quot; is a song by American singer Mariah Carey from her tenth studio album, The Emancipation of Mimi (2005). The song was released on March 29, 2005, through Island Records, as the second single from the album. &quot;We Belong Together&quot; was written by Carey, Jermaine Dupri, Manuel Seal, and Johnt&aacute; Austin, and produced by the former three. Since the song interpolates lyrics from Bobby Womack's &quot;If You Think You're Lonely Now&quot; (1981) and the Deele's &quot;Two Occasions&quot; (1987), the songwriters of those respective songs are credited. &quot;We Belong Together&quot; is built on a simple piano arrangement with an understated backbeat. The lyrics chronicle a woman's desperation for her former lover to return",
		info2: "Following her decline in popularity between 2001 and 2005, critics dubbed the song her musical comeback, as many had considered her career over. &quot;We Belong Together&quot; earned her several music industry awards and nominations throughout 2005&ndash;06. The song broke chart records in the United States and became Carey's sixteenth topper on the US Billboard Hot 100. After staying at number one for fourteen non-consecutive weeks, it joined four other songs in a tie as the second longest running number one song in US chart history, behind Carey's own 1995 collaboration with Boyz II Men titled &quot;One Sweet Day&quot;. Billboard listed it as the &quot;song of the decade&quot; and the eleventh most popular song of all time. Additionally, it broke several airplay records, gathering both the largest one-day and one-week audiences in history. &quot;We Belong Together&quot; also topped the charts in Australia and reached the top five in Denmark, Hungary, Ireland, the Netherlands, New Zealand, Scotland, Spain, and the United Kingdom."
		},
		{
            year: 2006,
            song: "Bad Day",
		artist: "Daniel Powter",
		info1: "&quot;Bad Day&quot; is a pop song from Canadian singer Daniel Powter's self-titled second studio album (2005). It was written by Powter and produced by Jeff Dawson and Mitchell Froom. Powter and Dawson recorded the song in 2002 but they could not find a record label to release it at first. The song was first used in a French Coca-Cola television advertisement in Christmas 2004 before its official release. Tom Whalley, Warner Bros. Records' chairman and CEO, offered Powter a contract after hearing a demo tape of it. This track ended up being released as the aforementioned album's lead single in Europe in early 2005.",
		info2: "Although &quot;Bad Day&quot; received mixed critical reviews, with some music critics praising its &quot;universal appeal&quot; while others felt it lacked depth in its lyrics, it was a commercial success. In 2005, the single charted in the top five in more than ten countries worldwide and became the most played song on European radio. After its European success, it was released in the United States where it topped the Billboard Hot 100, Pop 100, Adult Top 40, and Adult Contemporary charts. In 2006, it became the first song ever to sell two million digital copies in the United States. After another million were sold, it was certified three-times platinum by the Recording Industry Association of America (RIAA) in 2009. It was certified platinum in Australia, Canada, and the United Kingdom, gold in Denmark and Germany, and also received a certification in France and Japan."
		},
		{
            year: 2007,
            song: "Irreplaceable",
		artist: "Beyoncé",
		info1: "&quot;Irreplaceable&quot; is a song recorded by American singer Beyonc&eacute; for her second studio album, B'Day (2006). The song was written by Shaffer &quot;Ne-Yo&quot; Smith, Tor Erik Hermansen, Mikkel, S. Eriksen, Espen Lind, Amund Bj&oslash;rklund, Beyonc&eacute; and produced by Stargate and Beyonc&eacute;. &quot;Irreplaceable&quot; was originally a country record; it was re-arranged as a mid-tempo ballad with pop and R&amp;B influences by modifying the vocal arrangements and instrumentation. During the production and recording sessions, Beyonc&eacute; and Ne-Yo wanted to create a record which people of either gender could relate to. The song's lyrics are about the breakdown of a relationship with an unfaithful man and the song contains a message about female empowerment.",
		info2: "Following the moderate chart performances of &quot;D&eacute;j&agrave; Vu&quot; and &quot;Ring the Alarm&quot;, &quot;Irreplaceable&quot; was released internationally on October 23, 2006 as the album's second single, and the third in the United States on December 5, 2006. The single was released through Columbia Records. Pitchfork Media and Rolling Stone placed it on their lists of Best Songs of the 2000s. &quot;Irreplaceable&quot; won several awards, including Best R&amp;B/Soul Single at the 2007 Soul Train Music Awards. It was nominated for the Record of the Year award at the 50th Grammy Awards."
		},
		{
            year: 2008,
            song: "Low",
		artist: "Flo Rida featuring T-Pain",
		info1: "&quot;Low&quot; is the debut single by American rapper Flo Rida, featured on his debut studio album Mail on Sunday and also featured on the soundtrack to the 2008 film Step Up 2: The Streets. The song features and was co-written by fellow American rapper T-Pain. There is also a remix in which the hook is sung by Nelly rather than T-Pain. An official remix was made which features Pitbull and T-Pain. With its catchy, up-tempo and club-oriented Southern hip hop rhythms, the song peaked at the summit of the U.S. Billboard Hot 100.",
		info2: "The song was a massive success worldwide and was the longest-running number-one single of 2008 in the United States, spending ten consecutive weeks atop the Billboard Hot 100. With over six million digital downloads, it has been certified 8&times; Platinum by the RIAA, and was the most downloaded single of the 2000s decade, measured by paid digital downloads.The song was named third on the Billboard Hot 100 Songs of the Decade."
		},
		{
            year: 2009,
            song: "Boom Boom Pow",
		artist: "The Black Eyed Peas",
		info1: "&quot;Boom Boom Pow&quot; is a song by The Black Eyed Peas released as the lead single from their fifth studio album, The E.N.D.",
		info2: "&quot;Boom Boom Pow&quot; topped the Billboard Hot 100, making it the group's first U.S. number one single. It is the second longest-running single to stay atop the Hot 100 in 2009, beaten only by The Black Eyed Peas' second single from The E.N.D, &quot;I Gotta Feeling&quot;, which held the top spot for 14 consecutive weeks. It has also topped the Australian, Canadian and UK singles charts as well as reaching the top 10 in more than 20 countries. The song was named 7th on the Billboard Hot 100 Songs of the Decade and 51st on the Billboard Hot 100 Songs of All-time."
		},
		{
            year: 2010,
            song: "Tik Tok",
		artist: "Kesha",
		info1: "&quot;Tik Tok&quot; (stylized as &quot;TiK ToK&quot;) is the debut single by American singer Kesha. She co-wrote the song with its producers Dr. Luke and Benny Blanco. It was released on August 7, 2009, as the lead single from Kesha's debut studio album, Animal. The opening line of the song came from an experience where Kesha woke up surrounded by beautiful women, to which she imagined Diddy being in a similar scenario. The experience triggered the writing of the song which she later brought to her producer, Dr. Luke, who was then contacted by Diddy in hopes of a collaboration; he came to the studio the same day and recorded his lines and the song was completed. According to Kesha, the song's lyrics are representative of her and based on her life; the song has a carefree message and talks about not letting anything bring you down.",
		info2: "The song is an electropop/dance-pop song incorporating a minimalist bitpop beat interspersed with handclaps and synths. The song's verses use a rap/sing vocal style while the chorus is sung; throughout the song the use of Auto-Tune is prominent. Musically, the song has been compared to the works of Lady Gaga, Uffie, and Fergie."
		},
		{
            year: 2011,
            song: "Rolling in the Deep",
		artist: "Adele",
		info1: "&quot;Rolling in the Deep&quot; is a song recorded by English singer Adele for her second studio album, 21. It is the lead single and opening track on the album. The song was written by Adele and Paul Epworth. The singer herself describes it as a &quot;dark blues-y gospel disco tune&quot;. The largest crossover hit in the United States from the past 25 years, &quot;Rolling in the Deep&quot; gained radio airplay from many different radio formats. It was first released on 2010 as the lead single from 21 in digital download format. The lyrics describe the emotions of a scorned lover.",
		info2: "&quot;Rolling in the Deep&quot; was acclaimed by music critics and represented a commercial breakthrough for Adele, propelling her to international success. The song reached number one in 11 countries and the top five in many more regions. It was Adele's first number-one song in the United States, reaching the top spot on many Billboard charts, including the Billboard Hot 100 where it was number one for seven weeks. By February 2012, &quot;Rolling in the Deep&quot; had sold over 8.7 million copies in the United States, making it the best-selling digital song by a female artist in the US, the second-best-selling digital song in the US and Adele's best-selling single outside her native country, topping her previous best-selling &quot;Chasing Pavements&quot;. Worldwide, it was the fifth-best-selling digital single of 2011 with sales of 8.2 million copies. As of 2018, &quot;Rolling in the Deep&quot; has sold over 20.6 million copies worldwide, making it the one of the best-selling digital singles of all-time."
		},
		{
            year: 2012,
            song: "Somebody That I Used to Know",
		artist: "Gotye featuring Kimbra",
		info1: "&quot;Somebody That I Used to Know&quot; is a song written by Belgian-Australian singer-songwriter Gotye, featuring New Zealander singer Kimbra. The song was released in Australia and New Zealand by Eleven Music on 5 July 2011 as the second single from Gotye's third studio album, Making Mirrors (2011). It was later released by Universal Music in December 2011 in the United Kingdom, and in January 2012 in the United States and Ireland. &quot;Somebody That I Used To Know&quot; was written and recorded by Gotye at his parents' house on the Mornington Peninsula in Victoria and is lyrically related to the experiences he has had with relationships.",
		info2: "&quot;Somebody That I Used to Know&quot; is a mid-tempo ballad. It samples Luiz Bonf&aacute;'s instrumental &quot;Seville&quot; from his 1967 album Luiz Bonfa Plays Great Songs. The song received a positive reception from critics, who noted the similarities between the song and works by Sting, Peter Gabriel, and American folk band Bon Iver. In Australia, the song won the Triple J Hottest 100 poll at the end of 2011, as well as ARIA Awards for song of the year and best video, while Kimbra was voted best female artist and Gotye was named best male artist and producer of the year. The song came ninth in the Triple J Hottest 100 of the Past 20 Years, 2013. In 2013, the song won two Grammy Awards for Best Pop Duo/Group Performance and Record of the Year."
		},
		{
            year: 2013,
            song: "Thrift Shop",
		artist: "Macklemore & Ryan Lewis featuring Wanz",
		info1: "&quot;Thrift Shop&quot; is a song by American hip hop duo Macklemore &amp; Ryan Lewis. It was released on August 27, 2012 as Macklemore's eighth career single and the fourth single from their debut studio album, The Heist (2012). It features vocals by Wanz. The song was composed to show Macklemore's esteem for thrift shops and saving money, rather than flaunting expensive items like many rappers. Many music reviewers praised the song for its humorous lyrics and social critique.",
		info2: "Despite being released on Macklemore's independent label with distribution by the Alternative Distribution Alliance (ADA), a Warner Music Group company, the single was a sleeper hit. It reached number one on the US Billboard Hot 100 and has since sold over 7 million copies in the US alone. The song also reached number one in the United Kingdom, Ireland, Canada, France, Denmark, Netherlands, Australia and New Zealand. A music video was released simultaneously with the song on August 29, 2012, and has had more than 1.3 billion views on YouTube. In 2014, the single won two Grammy Awards, one for Best Rap Performance and one for Best Rap Song."
		},
		{
            year: 2014,
            song: "Happy",
		artist: "Pharrell Williams",
		info1: "&quot;Happy&quot; is a song written, produced, and performed by American singer Pharrell Williams, from the Despicable Me 2 soundtrack album. It also served as the lead single from Williams' second studio album, Girl (2014). It was first released on November 21, 2013, alongside a long-form music video. The song was reissued on December 16, 2013, by Back Lot Music under exclusive license to Columbia Records, a division of Sony Music.",
		info2: "&quot;Happy&quot; is an uptempo soul and neo soul song on which Williams's falsetto voice has been compared to Curtis Mayfield by critics. The song has been highly successful, peaking at No. 1 in the United States, United Kingdom, Canada, Ireland, New Zealand, and 19 other countries. It was the best-selling song of 2014 in the United States with 6.45 million copies sold for the year, as well as in the United Kingdom with 1.5 million copies sold for the year. It reached No. 1 in the UK on a record-setting three separate occasions and became the most downloaded song of all time in the UK in September 2014; it is the eighth highest-selling single of all time in the country. It was nominated for an Academy Award for Best Original Song. A live rendition of the song won the Grammy Award for Best Pop Solo Performance at the 57th Annual Grammy Awards."
		},
		{
            year: 2015,
            song: "Uptown Funk",
		artist: "Mark Ronson featuring Bruno Mars",
		info1: "&quot;Uptown Funk&quot; is a song by British record producer Mark Ronson featuring American singer and songwriter Bruno Mars, from Ronson's fourth studio album, Uptown Special (2015). The song was released as the album's lead single on 10 November 2014 via digital download in several countries. &quot;Uptown Funk&quot; was written by Ronson, Mars, Philip Lawrence and Jeff Bhasker. Since the track interpolates &quot;All Gold Everything&quot; (2012), songwriting credits were added for a total of six. Produced by Ronson, Mars, and Bhasker, its composition began during a freestyle studio session between the former three by deciding to work on the jam that Mars and his band would play on tour. The song went through several incarnations, worked on for months during stressful sessions, recorded at multiple locations, and at one point it was nearly scrapped. Copyright controversies arose after the song's release, with multiple lawsuits and amendments to its songwriting credits. The latter, due to similarities with &quot;Oops Up Side Your Head&quot; (1979) by The Gap Band, keyboardist Rudolph Taylor, and producer Lonnie Simmons.",
		info2: "&quot;Uptown Funk&quot; received positive reviews from music critics. Several music critics noted its similarity with popular music from the 1980s. The song features heavy inspiration from the Minneapolis sound of 1980s-era funk music, having a spirit akin to works by Prince as well as Morris Day and The Time. &quot;Uptown Funk&quot; spent 14 consecutive weeks at number one on the US Billboard Hot 100, seven non-consecutive weeks at number one on the UK Singles Chart, and topped the charts in several other countries including Australia, Canada, France, Ireland and New Zealand. It became the best-selling single of 2015 and one of the best-selling of all-time."
		},
		{
            year: 2016,
            song: "Love Yourself",
		artist: "Justin Bieber",
		info1: "&quot;Love Yourself&quot; is a song recorded by Canadian singer Justin Bieber for his fourth studio album Purpose (2015). The song was released first as a promotional single on November 9, 2015, and later was released as the album's third single. It was written by Ed Sheeran, Benny Blanco and Bieber, and produced by Blanco. An acoustic pop song, &quot;Love Yourself&quot; features an electric guitar and a brief flurry of trumpets as its main instrumentation. During the song, Bieber uses a husky tone in the lower registers. Lyrically, the song is a kiss-off to a narcissistic ex-lover who did the protagonist wrong.",
		info2: "On the US Billboard Hot 100 and the UK Singles Chart, the song became Bieber's third consecutive number-one, where in the United States it spent 24 non-consecutive weeks in the top ten (later named the best-performing single of 2016) and was also Bieber's first number one on the Adult Contemporary chart, while in the United Kingdom it spent six weeks at the top. &quot;Love Yourself&quot; topped the charts in fifteen countries, including Australia, Canada, New Zealand, and Sweden. &quot;Love Yourself&quot; was nominated for two Grammy Awards: Song of the Year and Best Pop Solo Performance. It was the seventh-best-selling song of 2016 in the US."
		},
		{
            year: 2017,
            song: "Shape of You",
		artist: "Ed Sheeran",
		info1: "&quot;Shape of You&quot; is a song by English singer-songwriter Ed Sheeran. It was released as a digital download on 6 January 2017 as one of the double lead singles from his third studio album &divide; (2017), along with &quot;Castle on the Hill&quot;.",
		info2: "The dancehall-infused pop song[3] was written by Ed Sheeran, Steve Mac and Johnny McDaid. Additional writing credits were given to Kandi Burruss, Tameka &quot;Tiny&quot; Cottle, and Kevin &quot;She'kspere&quot; Briggs after the initial release of the song due to noted similarities with the melody of &quot;No Scrubs&quot; by TLC. The song was produced by Sheeran and Mac."
		},
		{
            year: 2018,
            song: "God's Plan",
		artist: "Drake",
		info1: "&quot;God's Plan&quot; is a song recorded by Canadian rapper Drake, released on January 19, 2018, through Young Money and Cash Money. Written by Aubrey Graham, Ronald LaTour, Daveon Jackson, Matthew Samuels, and Noah Shebib and produced by Cardo, Yung Exclusive, and Boi-1da, the track acts as a single from his second EP, Scary Hours (2018), and the lead single from his fifth studio album, Scorpion (2018). Musically, it has been described as pop, pop-rap and trap, whose lyrics talk about fame and his fate.",
		info2: "&quot;God's Plan&quot; got mostly positive reviews from music critics, calling it a typical Drake song. An accompanying music video for the song was directed by Karena Evans and uploaded onto Drake's official YouTube channel on February 16, 2018. In the video Drake is giving away nearly one million US dollars to people and institutions in Florida. It received five nominations at the 2018 MTV Video Music Awards, including for Video of the Year and three nominations at the 61st Grammy Awards for Record of the Year, Song of the Year, and Best Rap Song, winning the last one. Commercially the song became the 29th song in history to debut at number one on the US Billboard Hot 100, making it Drake's fourth chart-topper in that country, and second as a lead artist. The single topped the charts in fourteen countries, including the UK and Canada and reached the top ten in nine others. The song broke first-day streaming records on both Apple Music and Spotify, and was the most streamed song of the year on both services."
		},
    ];

    return info;
}