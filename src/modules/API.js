'use strict'
// API implementation
import axios from 'axios'

const BASE_URL = process.env.API_ENDPOINT
let axiosConfig = {}

export default {
  setToken: (newtoken) => {
    axiosConfig = {
      headers: {
        'Authorization': 'Bearer ' + newtoken
      }
    }
  },
  unsetToken: () => {
    axiosConfig = {}
  },
  // Log in
  login: async (email, password) => {
    let resp = await axios.post(BASE_URL + '/login', { email: email, password: password })
    return resp.data
  },
  // Registration
  registerUser: async (email, password) => {
    return axios.post(BASE_URL + '/users', {
      email: email,
      password: password,
      role: 'participant'
    })
  },
  // Password reset
  resetPW: async (email) => {
    return axios.post(BASE_URL + '/sendResetPasswordEmail', { email: email })
  },
  // Change password
  changePW: async (token, newpw) => {
    return axios.post(BASE_URL + '/resetPassword', { token: token, password: newpw })
  },
  searchDiseaseConcept: async (disease, lang) => {
    return axios.get(BASE_URL + '/vocabulary/' + lang + '/disorder/search?term=' + disease + '&limit=10')
  },
  searchMedicationConcept: async (med, lang) => {
    return axios.get(BASE_URL + '/vocabulary/' + lang + '/substance/search?term=' + med + '&limit=10')
  },
  /// ////////////////////////////////////
  // from here on, we need to use tokens
  /// ////////////////////////////////////

  // Create the participant profile
  createProfile: async function (profile) {
    return axios.post(BASE_URL + '/participants', profile, axiosConfig)
  },

  // Get the participant profile
  getProfile: async function (userKey) {
    const resp = await axios.get(BASE_URL + '/participants/byuserkey/' + userKey, axiosConfig)
    return resp.data
  },

  // Updating details
  updateProfile: async function (profile) {
    return axios.patch(BASE_URL + '/participants/byuserkey/' + profile.userKey, profile, axiosConfig)
  },

  // Permanently delete the user
  deleteUser: async function (userKey) {
    return axios.delete(BASE_URL + '/participants/byuserkey/' + userKey, axiosConfig)
  },

  // update status of a study
  updateStudyStatus: async function (userKey, studyKey, studyParticipation) {
    return axios.patch(BASE_URL + `/participants/byuserkey/${userKey}/studies/${studyKey}`, studyParticipation, axiosConfig)
  },

  // retrieves study descritpion
  getStudyDescription: async function (studyKey) {
    let resp = await axios.get(BASE_URL + '/studies/' + studyKey, axiosConfig)
    return resp.data
  },

  // retrieves the keys of the new studies already filtered out by inclusion criteria
  getNewStudiesKeys: async function () {
    let resp = await axios.get(BASE_URL + '/newStudies/', axiosConfig)
    return resp.data
  },

  // gets a form given its key
  getForm: async function (formKey) {
    let resp = await axios.get(BASE_URL + '/forms/' + formKey, axiosConfig)
    return resp.data
  },

  // send answers to server
  sendAnswers: async function (answers) {
    return axios.post(BASE_URL + '/answers', answers, axiosConfig)
  },

  // send health data from query
  sendDataQuery: async function (data) {
    return axios.post(BASE_URL + '/healthStoreData', data, axiosConfig)
  },

  // send data from SMWT
  sendSMWTData: async function (data) {
    return axios.post(BASE_URL + '/SMWTData', data, axiosConfig)
  },

  // send data from QCST
  sendQCSTData: async function (data) {
    return axios.post(BASE_URL + '/QCSTData', data, axiosConfig)
  },

  // send data from miBand3 stored data
  sendMiBand3Data: async function (data) {
    // TBD!!!
    return Promise.resolve()
  }
}
