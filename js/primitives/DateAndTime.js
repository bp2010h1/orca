
// Runtime depends on: boxing.js

(function() {

	st.DateAndTime._addClassMethods({
		now: function() {
			var now = new Date();

			return this.year_month_day_hour_minute_second_nanoSecond_offset_(
				st.number(now.getUTCFullYear()),
				st.number(now.getUTCMonth() + 1),
				st.number(now.getUTCDate()),
				st.number(now.getUTCHours()),
				st.number(now.getUTCMinutes()),
				st.number(now.getUTCSeconds()),
				st.number(now.getUTCMilliseconds() * 1000000),
				st.Duration.minutes_(st.number(-1 * now.getTimezoneOffset()))); 
		}
	});
})();
