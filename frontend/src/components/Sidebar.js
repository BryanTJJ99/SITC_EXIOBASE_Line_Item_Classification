import React, {useState} from "react"
import styles from "../styles/sidebar.module.css"
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload'
// import { makeStyles } from "@material-ui/core/styles";
import { CSVLink } from "react-csv";

import axios from "axios";


export default function Sidebar(props) {

    let selectedItem = props.selectedItem


    function copyBoxText() {
        console.log(selectedItem.join('\t'))
        const editedSelectedItem = selectedItem.join('\t')
        navigator.clipboard.writeText(editedSelectedItem)
        document.execCommand('paste')
    }

    const fileInput = React.useRef()


    var csv = require('jquery-csv')

    
    const [csvData,setCsvData] = useState(null) 
    const [timeTaken,setTimeTaken] = useState(0) 
    const [wait,setWait] = useState(null)
    const [fileName,setFileName] = useState('empty.csv')

    // csvHeaders to correspond to the column header names in CSV file
    const csvHeaders = [
        { label: "ITEM", key: "ITEM" },
        { label: "UNIT_PRICE", key: "UNIT_PRICE" },
        { label: "UNITS", key: "UNITS" },
        { label: "CURRENCY", key: "CURRENCY" },
        { label: "COUNTRY", key: "COUNTRY" },
        { label: "REGION", key: "REGION" },
        { label: "EXIOBASE_COUNTRY", key: "EXIOBASE_COUNTRY" },
        { label: "EXIOBASE_CAT", key: "EXIOBASE_CAT" },
        { label: "SPEND_CAT", key: "SPEND_CAT" },
        { label: "ITEM_CAT1", key: "ITEM_CAT1" },
        { label: "ITEM_CAT2", key: "ITEM_CAT2" },
        { label: "TRANSPORT", key: "TRANSPORT" },
        { label: "SUPPLIER", key: "SUPPLIER" },
        { label: "SCOPE", key: "SCOPE" },
        { label: "EF_SUPPLIER", key: "EF_SUPPLIER" },
        { label: "EF_LOCATION", key: "EF_LOCATION" },
        { label: "EF_AVERAGE", key: "EF_AVERAGE" },
        { label: "EXIO_PROB", key: "EXIO_PROB" }
      ];

    //   Post Request to backend to run classification engine
    async function postDataRequest(data) {
        const start = new Date()
        let res = await axios.post('http://localhost:5000/upload',data)
        setTimeTaken(((new Date())-start)/1000) // in seconds
        let newData = res.data

        setCsvData(newData.data)
        console.log(csvData)
        setWait(null)
        return console.log('completed!!!')
    }

    //  Runs after Auto-Classify button is clicked
    const handleOnChange = (e) => {
        setCsvData(null)
        setWait('Running, please wait a moment...')
        console.log(e.target.files)
        let file = e.target.files[0]
        console.log(typeof(file.name))
        setFileName(file.name)
        var reader = new FileReader()
        reader.readAsText(file)
        reader.onload = (e) => {
            console.log(e.target.result)
            var csvFile = e.target.result
            var data = csv.toObjects(csvFile)
            console.log(data)
            return postDataRequest(data)
        }
    };


    return (
        <section className = {styles.sideBar}>

            {/* ExioCountry, Exiobase and SITC Tabs */}
            <div className = {styles.sideBarHeader}>
                <h2>Item Classification</h2>
            </div>
            <div  onClick = {() => props.setPages({'tabName':'ExioCountry'}) } className = {styles.sideBarTab}>
                <h4>ExioCountry</h4>
            </div>
            <div  onClick = {() => props.setPages({'tabName':'Exiobase'}) } className = {styles.sideBarTab}>
                <h4>Exiobase</h4>
            </div>
            <div  onClick = {() => props.setPages({'tabName':'SITC'})} className = {styles.sideBarTab}>
                <h4>SITC</h4>
            </div>

            {/* CopyText Box */}
            <div className= {styles.copyBox} onClick= {copyBoxText}>
                
                <h5>Copied Tags</h5>
                

                {selectedItem.map( ele => <Chip key={ele} 
                                        label={ele} 
                                        onDelete={() => props.delete(ele)}
                                        onMouseDown={(event) => {event.stopPropagation()}}
                                        style={{marginTop:'5px', backgroundColor: '#F4F4FB'}}
                                        >
                                        {ele}
                                        </Chip>)}
                {console.log(selectedItem)}
                
            </div>

            {/*Classification Engine upload file*/}
            <Button variant="outlined" startIcon={<FileUploadIcon />} style={{ marginTop: '5vh', margin: 'auto', backgroundColor: '#ced5ed', 
            width: '25vh'}}
            onClick={() => fileInput.current.click()}
            >
            Auto Classify
            <input ref={fileInput}  onChange={(e)=>{handleOnChange(e) 
                                                    e.target.value = null}}  //explanation on why e.target.value is set back to null: https://stackoverflow.com/questions/62408452/react-file-input-only-works-once

            type="file" style={{ display: 'none' }} hidden/>
            </Button>
            
            {wait !== null && 
            <h4 style={{margin: "auto", fontSize:"16px",color: "#fcfcff"}}>{wait}</h4>}

            {csvData !== null && (
                <div style={{margin: 'auto'}}>
                    <CSVLink data={csvData}
                        headers={csvHeaders}
                        style={{ margin: 'auto', marginLeft: '9.5vh',backgroundColor: '#ced5ed',
                        width: '20vh', color: "#267ABE", textAlign: 'center', borderRadius: '10px',
                        padding:'5px', fontSize:"15px"}}
                        filename={fileName.slice(0, -4) + '_Classified' + '.csv'}
                        > Download 
                    </CSVLink>
                    <h4 style={{fontSize:"14px"}}>Completed! Time Taken: {timeTaken} seconds</h4>
                </div>
                                    )}
        </section>


    )
}

