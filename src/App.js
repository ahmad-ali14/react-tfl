import React, { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';

function App() {
  var [modes, setModes] = useState([]);
  var [initData, setInitData] = useState([]);
  var [data, setData] = useState({});
  var [singleMode, setSingleMode] = useState('')

  useEffect(() => {
    axios.get('https://api.tfl.gov.uk/Line/Route?ids=100&serviceTypes=Regular')
      .then(res => setInitData(initData = res.data))
  }, [])

  useEffect(() => {
    axios.get('https://api.tfl.gov.uk/Line/Meta/Modes')
      .then(res => { setModes(modes = res.data); })
  }, [])

  useEffect(() => {
    let temp = {};
    if (initData.length > 0 && modes.length > 0) {
      modes.map((t) => {
        let fliteredData = initData.filter((d) => { return d.modeName == t.modeName });
        temp[t.modeName] = fliteredData;

      })
    }
    return setData(data = temp);
  }, [modes, initData])

  const selectMode = (v) => {
    setSingleMode(singleMode = v);
  }

  return (
    <div className="App">
      <h1> Transport For London React Hooks </h1>
      {<ModesDropDown
        types={modes}
        selectMode={selectMode}
      />}
    </div>
  );
}

export default App;


const ModesDropDown = ({ types, selectMode }) => {
  return (
    <select onChange={e => { selectMode(e.target.value) }}>
      {types.length > 1 && types.map((t) => {
        return (
          <option key={t.modeName} value={t.modeName} > {t.modeName}</option>
        );
      })}
    </select>
  )
}