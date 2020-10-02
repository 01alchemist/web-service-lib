import StatsD from "hot-shots";
import os from "os";
const datadog = new StatsD({
  cacheDns: true,
  maxBufferSize: 1500,
});

function appendHostName(tags) {
  const hostname = os.hostname();
  if (Array.isArray(tags) && tags.find((tag) => tag.indexOf("host:") === -1)) {
    tags.push(`host:${hostname}`);
  } else if (tags && !tags.host) {
    tags.host = hostname;
  }
  return tags;
}

const createStats = (config: any = {}) => {
  const prefix = config.prefix || "";
  return {
    gauge(metric, value, tags: string[] = [], callback?) {
      return datadog.gauge(
        prefix + metric,
        value,
        appendHostName(tags),
        callback
      );
    },
    increment(metric, value, tags: string[] = [], callback?) {
      return datadog.increment(
        prefix + metric,
        value,
        appendHostName(tags),
        callback
      );
    },
    event(title, text, properties: any = {}, callback?) {
      properties.hostname =
        properties.host || properties.hostname || os.hostname();
      return datadog.event(title, text, properties, callback);
    },
    histogram(stat, value, tags, callback?) {
      return datadog.histogram(stat, value, appendHostName(tags), callback);
    },
    /**
     * Starts a timer for the given timerId and returns a function to stop that
     * timer and send the duration to Datadog
     *
     * @param {String} timerId
     * @param {Array} tags
     *
     * @example
     * const stopMyTimer = startTimer('myTimer', ['tag:value'])
     * async doAsyncStuffThatNeedsToBeTimed();
     * stopMyTimer();
     */
    startTimer(timerId, tags) {
      const startTime = Date.now();
      return () => {
        const duration = Date.now() - startTime;
        datadog.histogram(timerId, duration, appendHostName(tags));
      };
    },
  };
};
export const datadogStats = createStats();
export default createStats;
