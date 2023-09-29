import React from "react"
import styles from "../styles/ExioCountry.module.css"
import MaterialTable from 'material-table'

// material-table version: npm install material-table@1.69.3 --save

export default function ExioCountry(props){
    

    const countryData= require('../data/country.json')

    const columns=[
        {title:"Country list",field:"Country list"},
        {title:"Exiobase Country",field:"Exiobase country"}
    ]

    return(
        <div className = {styles.divContainer}>
            <div className={styles.table}>
                <h1>Exiobase Country</h1>
                <MaterialTable title = "Exiobase Country"
                data = {countryData}
                columns = {columns}
                options = {
                    {
                        search: false,
                        paging: true,
                        exportCsv: true,
                        filtering: true,
                        pageSize: countryData.length,
                        maxBodyHeight: "500px"
                        
                    }
                }
                onRowClick = {props.copy}
                />    
            </div>
        </div>
)

}

