'use strict'
import miband3Driver from './Miband3Driver'

export default {
  /**
   * Finds all Miband3 around and returns an array of device objects, each containing an ID (MAC address) and RSSI
   * If a timeout occurs or BLE is not activated, the promise is rejected
   * @param {Number} timeout max number of milliseconds to search for a Miband3
   */
  async search (searchTime) {
    // TODO
    return new Promise((resolve, reject) => {
      let devices = []
      window.ble.startScan([], (device) => {
        if (device.name === 'Mi Band 3') {
          devices.push(device)
        }
      }, reject)
      setTimeout(window.ble.stopScan, searchTime, (success) => {
        resolve(devices)
      }, reject)
    })
  },
  /**
   * Connects to a MiBand3
   * @param {Object} device a device object as returned by search() + can contain an authentication key
   * @param {Function} disconnectCallback called if the device is disconnected
   */
  async connect (device) {
    // TODO
    // generate the key if not inside device
    if (!device.key) {
      let key = miband3Driver.generateKey()
      device.key = key
    }
    // init
    miband3Driver.init(device.id, device.key)
    // connect
    return miband3Driver.connect()
  },

  /**
   * Disconnects from the tracker
   */
  async disconnect () {
    // TODO
    return miband3Driver.disconnect()
  },

  /**
   * Returns true if connected to a Miband3
   */
  async isConnected () {
    // TODO
    return miband3Driver.isConnected()
  },

  /**
   * Authenticates the phone with the Miband3
   * @param {boolean} full if true the full authentication is performed
   */
  async authenticate (full) {
    // TODO
    return miband3Driver.authenticate(full)
  },

  /**
   * Configures a Miband3
   * @param {Object} user a user configuration like { height: 180, weight: 80, dob: '1974-11-21', sex: 'male', language: 'en' }
   * @param {number} hrFreq how often HR is measured in minutes
   */
  async configure (user, hrFreq) {
    // configures:
    // user, language = EN, dateFormat = 'DD/MM/YYYY, hrFreq, wearLocation=LEFT
    // displayOnlift = not [22:00 - 8:00], nightMode = [22:00 - 8:00],
    // screens = [home, HR, status], HRsleep support = YES, timeFormat = 24G
    // TODO

    // Default settings
    await miband3Driver.setLanguage('EN_en')
    await miband3Driver.setDateFormat(true)
    await miband3Driver.setDistanceType(false)
    await miband3Driver.setTimeFormat('24h')
    // Synch phone time with miband watch time
    await miband3Driver.setCurrentTimeStatus()

    // Setting night mode between 22:00 and 8:00
    let dateStartHour = new Date()
    dateStartHour.setHours(22)
    dateStartHour.setMinutes(0)
    let dateEndHour = new Date()
    dateEndHour.setHours(8)
    dateEndHour.setMinutes(0)
    await miband3Driver.setNightMode(dateStartHour, dateEndHour)
    await miband3Driver.setHRSleepSupport(true)

    // setting screen pages
    let screens = ['activity', 'heartRate', 'status']
    await miband3Driver.setupScreens(screens)
    // Maybe we need to expose the HR functionality to a third party?, i'm guessing this may be the case.
    // Dario: NO, do not expose.

    // User supplied settings
    await miband3Driver.setHeartRateMeasurementInterval(hrFreq)
    // make sure thee DOB is a date
    let DOB = new Date(user.dob)
    await miband3Driver.setUser(
      user.height,
      user.weight,
      DOB.getFullYear(),
      DOB.getMonth() + 1,
      DOB.getDate(),
      user.sex === 'female' // false for male
    )
    miband3Driver.stopAllNotifications() // In practice only stops the authentication notifications, and maybe if something else is missed.
  },

  /**
   * Retrieves information about the device
   */
  async getDeviceInfo () {
    // TODO
    // see example:
    // {
    //   id: 'AAAA',
    //   battery: 80,
    //   charging: false, why do we need this?
    //   swVersion: '11',
    //   hwVersion: '3',
    //   serialNumebr: 'asdasd'
    // }
    let time = await miband3Driver.getTimeStatus()
    let battery = await miband3Driver.getBatteryStatus()
    let hardware = await miband3Driver.getHardwareInfo()
    let software = await miband3Driver.getSoftwareInfo()
    // let serialNr = await miband3.getSerialNumber() needs to be implemented
    // let charging = await miband3.getCharging() do we need this? for what? if yes the needs to be implemented
    return Promise.resolve({
      id: miband3Driver.deviceId,
      battery: battery,
      hwVersion: hardware,
      swVersion: software,
      clock: time
    })
  },

  /**
   * Retrieves the data stored on the tracker
   * @param {Date} startDate a JS Date object from which we want to retrieve the data
   * @param {Function} cbk called at every sample of data retrieved
   */
  async getStoredData (startDate, cbk) {
    // TODO
    function interfaceCallback (data) { // Filters the noisy heart rate values, eg 0 and 255.
      if (data.hr === 0 || data.hr === 255) {
        data.hr = Number.NaN
      }
      cbk(data)
    }
    return miband3Driver.fetchStoredData(startDate, interfaceCallback)
  },

  /**
   * Starts live streaming of heart rate
   * @param {function} callback retrieves the heart rate, as a single number
   */
  async startLiveHR (callback) {
    return miband3Driver.startHRContinuousMonitoring(callback)
  },

  /**
   * Stops streaming heart rate
   */
  async stopLiveHR () {
    return miband3Driver.stopHRMonitoring()
  }
}
