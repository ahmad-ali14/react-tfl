import React, { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';
import Chart from "react-google-charts";


function App() {
  var [modes, setModes] = useState([]);
  var [initData, setInitData] = useState([]);
  var [data, setData] = useState({});
  var [singleMode, setSingleMode] = useState('');
  var [selectedLine, setSelectedLine] = useState([]);
  var [show, setShow] = useState([]);
  var [visible, setVisible] = useState({
    typesDropDwon: false,
    dest: false,
    chart: 0,
  })


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

  useEffect(() => {
    let addedShow = [];
    for (const property in data) {
      show.push([property, data[property].length]);
    }

    setShow([...show, ...addedShow]);
    console.log(show)
    setVisible({ ...visible, chart: true });

  }, [data])

  const selectMode = (v) => {
    if (v === 'mode') { return; }
    setSingleMode(singleMode = v);
    setVisible({ ...visible, typesDropDwon: true });

  }

  const setOneLine = (v) => {
    let filtered = data[singleMode].filter(e => e.name == v);
    setSelectedLine(selectedLine = filtered);
    setVisible({ ...visible, dest: true });
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 text-center mb-3 p-5">
          <h1> Transport For London React Hooks </h1>
        </div>
        <div className="col-md-6">
          {typeof data.bus !== undefined && <ModesDropDown
            types={modes}
            selectMode={selectMode}
            data={data}
          />}
        </div>
        <div className="col-md-6">
          {visible.typesDropDwon && <ModeDetails
            data={data}
            singleMode={singleMode}
            setOneLine={setOneLine}
          />}
        </div>
      </div>
      <div className="row" >
        <div className="col-12 text-center mb-3 p-5">
          {visible.dest && <DestTable
            selectedLine={selectedLine}
          />}
        </div>
      </div>
      <div className="row text-center mt-2" style={{ display: 'flex', maxWidth: '100%' }}>
        {visible.chart && <LondonChart
          show={show}
        />}
      </div>
    </div>
  );
}

export default App;


const ModesDropDown = ({ data, types, selectMode }) => {
  return (
    <select class="custom-select" onChange={e => { selectMode(e.target.value) }}>
      <option value="mode" defaultValue="mode">choose Transport Method</option>
      {types.length > 1 && types.map((t) => {
        // let tt = data[t.modeName];
        return (
          <>
            {/* {data[t.modeName].length > 0 ? <option key={t.modeName} value={t.modeName} > {t.modeName}</option> : ''} */}
            <option key={t.modeName} value={t.modeName} > {t.modeName}</option>
          </>
        );
      })}
    </select>
  )
}

const ModeDetails = ({ data, singleMode, setOneLine }) => {
  let typesArr = data[singleMode];
  if (singleMode == 'mode') { typesArr = []; }

  return (
    <select class="custom-select" onChange={e => { return setOneLine(e.target.value); }}>
      <option value="mode" defaultValue="mode">choose Line</option>
      {typesArr.length === 0 && <option value="mode" defaultValue="mode">No data Available</option>}
      {typesArr.length > 0 && typesArr.map((t) => {
        return (
          <option key={t.name} value={t.name} > {t.name}</option>
        );
      })}
    </select>
  )
}

const DestTable = ({ selectedLine }) => {
  let line = selectedLine[0] ? selectedLine[0] : {
    modeName: '#',
    name: 'No Line Choosen'
  };
  return (
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Type</th>
          <th scope="col">Name</th>
          <th scope="col">Destination 1</th>
          <th scope="col">Destination 2</th>
        </tr>
      </thead>
      <tbody>


        {line && line.routeSections && line.routeSections.length > 0 ? (line.routeSections.map((route) => {
          return (
            <tr>
              <th scope="row">{line.modeName ? line.modeName : 'No Line Choosen'}</th>
              <td>{line.name ? line.name : 'No Line Choosen'}</td>
              <td>{route.originationName}</td>
              <td>{route.destinationName}</td>
            </tr>)
        })) : (
            <tr>
              <th scope="row">{line.modeName ? line.modeName : 'No Line Choosen'}</th>
              <td>{line.name ? line.name : 'No Line Choosen'}</td>
              <td>{line.routeSections ? line.routeSections[0].originationName : 'No Line Choosen'}</td>
              <td>{line.routeSections ? line.routeSections[0].destinationName : 'No Line Choosen'}</td>
            </tr>

          )

        }


      </tbody>
    </table>
  )
}


const LondonChart = ({ show }) => {

  let s = show.length;
  if (s > 1) {
    return (
      <Chart
        width={'100%'}
        height={'100%'}
        chartType="Bar"
        loader={<div>Loading Chart</div>}
        data={[
          ['Transport Method', 'Number of lines'],
          ...show
        ]}
        options={{
          // Material design options
          chart: {
            title: 'London Transport Profile',
            subtitle: 'Number of Lines Working on every method of transport by june 2020',
          },
        }}
        // For tests
        rootProps={{ 'data-testid': '2' }}
      />);

  }

  return (<></>)


}
