var React = require('react');
var classSet = require('../utils/classSet');
var ajax = require('../utils/ajax');
var PlayButton = require('./components/play-button');
var Spinner = require('./components/spinner');

module.exports = React.createClass({
  displayName: 'Video',
  propTypes: {
    from: React.PropTypes.oneOf(['youtube', 'vimeo']).isRequired,
    videoId: React.PropTypes.string.isRequired
  },
  getDefaultProps() {
    return {
      className: 'video'
    };
  },
  getInitialState() {
    return {
      thumb: null,
      imageLoaded: false,
      showingVideo: false
    };
  },
  componentDidMount() {
    this.props.from === 'youtube' && this.fetchYoutubeData();
    this.props.from === 'vimeo' && this.fetchVimeoData();
  },
  componentWillUnmount() {
    this.abortRequest();
  },
  componentWillReceiveProps() {
    this.abortRequest();
  },
  abortRequest() {
    if (this.request) {
      this.request.abort();
    }
  },
  render() {
    return (
      <div className={this.props.className} >
        {!this.state.imageLoaded && <Spinner />}
        {this.renderImage()}
        {this.renderIframe()}
      </div>
    );
  },
  renderImage() {
    var style = {
      backgroundImage: `url(${this.state.thumb})`
    };

    if (this.state.imageLoaded && !this.state.showingVideo) {
      return (
        <div className='video-image' style={style}>
          <PlayButton onClick={this.playVideo} />
        </div>
      );
    }
  },
  renderIframe() {
    var embedVideoStyle = {
      display: this.state.showingVideo ? 'block' : 'none',
      width: '100%',
      height: '100%'
    };

    if (this.state.showingVideo) {
      return (
        <div className='video-embed' style={embedVideoStyle}>
          <iframe frameborder='0' src={this.getIframeUrl()}></iframe>
        </div>
      );
    }
  },
  playVideo(ev) {
    this.setState({ showingVideo: true });
    ev.preventDefault();
  },
  getIframeUrl() {
    if (this.props.from === 'youtube') {
      return `//youtube.com/embed/${this.props.videoId}?autoplay=1`
    }
    else if (this.props.from === 'vimeo') {
      return `//player.vimeo.com/video/${this.props.videoId}?autoplay=1`
    }
  },
  fetchYoutubeData() {
    var id = this.props.videoId;
    var url = `https://gdata.youtube.com/feeds/api/videos/${id}?v=2&alt=json`;

    this.request = ajax.get(url, (err, res) => {
      var gallery = res.entry['media$group']['media$thumbnail'];
      var thumb = gallery.sort((a, b) => b.width - a.width)[0].url;

      this.setState({
        thumb: thumb,
        imageLoaded: true
      });
    });
  },
  fetchVimeoData() {
    var id = this.props.videoId;
    var url = `https://vimeo.com/api/v2/video/${id}.json`;

    this.request = ajax.get(url, (err, res) => {
      this.setState({
        thumb: res[0].thumbnail_large,
        imageLoaded: true
      });
    });
  }
});
