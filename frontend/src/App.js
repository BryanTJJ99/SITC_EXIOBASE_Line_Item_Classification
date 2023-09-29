import React from "react"
import styles from "./styles/app.module.css"

// Import Components
import Sidebar from "./components/Sidebar"
import ExioCountry from "./components/ExioCountry"
import Exiobase from "./components/Exiobase"
import SITC from "./components/SITC"

function App() {

  // Array clicks
  const [copiedArray,setCopiedArray] = React.useState([])

  const handleDelete = (value) => {
    setCopiedArray((copiedArray) => copiedArray.filter((ele) => ele !== value))
  }

  const copyText = (e) => {
    // console.log(e.target.textContent);
    navigator.clipboard.writeText(e.target.textContent)
    setCopiedArray(prevCopiedArray => 
      prevCopiedArray.includes(e.target.textContent) ? [...prevCopiedArray] : 
    [...prevCopiedArray, e.target.textContent])
  }

  const [pages,setPages] = React.useState(
    {'tabName':'ExioCountry'}
    )


  return (
    <div className={styles.app}>
        <Sidebar setPages = {setPages}  selectedItem = {copiedArray} delete={handleDelete}/>
        {pages.tabName === 'ExioCountry' && (<ExioCountry copy = {copyText}/>)}
        {pages.tabName === 'Exiobase' && (<Exiobase copy = {copyText}/>)}
        {pages.tabName === 'SITC' && (<SITC copy = {copyText}/>)}
    </div>
  )
}

export default App;

