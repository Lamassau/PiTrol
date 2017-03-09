import React, { Component } from 'react'

module.exports.PiStatusComponent = class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hours: null,
      minutes: null,
      seconds: null
    }
    this.loadData()
  }
  loadData () {
    fetch(`${this.props.loadFrom}`)
     .then((res) => res.json())
     .then((res) => this.setState(res))
     .catch((e) => this.setState({hours: undefined}))
  }
  getData () {
    switch (this.state.hours) {
      case null:
        return 'Loading'
      case undefined:
        return 'system is Down'
      default:
        return `${this.state.hours} Hr(s) & ${this.state.minutes} Min(s)`
    }
  }
  render () {
    return (
      <center>
        <h1>System Uptime</h1>
        <small>This plugin refreshes once every {this.props.reloadEvery / 1000} second(s)</small>
        <h3>{this.getData()}</h3>
      </center>
    )
  }
  componentDidMount () {
    setInterval(() => this.loadData(), this.props.reloadEvery)
  }
}
