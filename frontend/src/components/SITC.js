import React from "react"
import styles from "../styles/SITC.module.css"

//SELECT Box
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';


// TABLE
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";



const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


const useStyles = makeStyles(theme => ({
    root: {
      width: "100%",
      marginTop: theme.spacing(3),
      overflowX: "auto"
    },
    table: {
      minWidth: 700
    },
    tableCell: {
        maxWidth: 500,
      }
    
  }))

  function getStyles(name, category, theme) {
    return {
      fontWeight:
        category.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }
  
  // For Dropdown label (SITC Category)
  const sitcCategoryLabel = require('../data/SITC.json').map( x => x['SITC Category'])
  
    // For table
  const sitcData= require('../data/SITC.json')
  function totalCat2perSITC(cat,obj) {
    let num = 0
    if (cat==='SITC Category') {
        const x = obj['SubCat'].length
        for (let y = 0; y < x; y++) {
            num += obj['SubCat'][y]['Item Cat 2'].length
        }
    }
    return num
};


export default function SITC(props) {

    const theme = useTheme();
    const classes = useStyles();

    const [category, setCategory] = React.useState([]);
    const [elRefs,setElRefs] = React.useState({})
    
    const handleChange = (event) => {
        const value = event.target.value;
        setCategory(value);
        };

    const handleDelete = (value) => {
        setCategory((cats) => cats.filter((cat) => cat !== value))
      }


      const filteredCat = category.length < 1 ? [] : sitcData.filter( x => 
        category.some(el => x['SITC Category'].includes(el) && el.length === x['SITC Category'].length))

    
        React.useEffect(() => {
            setElRefs(elRefs => {
                const refs = {}
                filteredCat.map((e) => {
                    e.SubCat.map((e) => {
                        refs[e['Item Cat 1']] = React.createRef()
                    })
                })
                return refs
            })
        },[category])


        const handleScroll = (event) => {
            const value = event.target.outerText
            elRefs[value].current.scrollIntoView({behavior: 'smooth'})  
        }


    return(
        <div className = {styles.divContainer}>
            
            {/* SITC Category Bar */}
            <div className={styles.SITCCategoryBar}>
                <FormControl sx={{ m: 5, width: 400  }} >
                    <InputLabel id="demo-multiple-chip-label">SITC Category</InputLabel>
                    <Select
                    labelId="demo-multiple-chip-label"
                    id="demo-multiple-chip"
                    multiple
                    value={category}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.0}} 
                        style={{maxHeight: 160, overflowY: 'scroll'}}>
                        {selected.map((value) => (
                            <Chip key={value} label={value}   onDelete={() => handleDelete(value)} onMouseDown={(event) => {
                                event.stopPropagation()
                            }}/>
                        ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                    >
                    {sitcCategoryLabel.map((label) => (
                        <MenuItem
                        key={label}
                        value={label}
                        style={getStyles(label, category, theme)}
                        >
                        {label}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </div>

            {/* Item Cat 1 Display Panel*/}
            <div className={styles.itemCat1Display}>
            {filteredCat.map( x => 
                <Paper className = {classes.tableCell}>
                    <Box sx={{ width: 500 }}>
                        <TableCell align="center">
                            <b>{x['SITC Category']}</b>
                        </TableCell>
                        {x['SubCat'].map( y => 
                        <Chip label = {y['Item Cat 1']} onClick = {event => handleScroll(event) }
                        style={{marginTop:'5px', }}
                        />
                            )}
                    </Box>
                </Paper>
                
                )}
            </div>

 



            {/* TABLE */}
            <div className={styles.table}>
                <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                    <TableRow>
                        <TableCell align="Center">SITC Category</TableCell>
                        <TableCell align="Center">Item Cat 1</TableCell>
                        <TableCell align="Center">Item Cat 2</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody> 
                    {filteredCat.length >= 1 && filteredCat.map( item => (
                        <>
                            <TableRow>
                                <TableCell onClick={props.copy} rowSpan={totalCat2perSITC('SITC Category',item) + item['SubCat'].length + 1}
                                style={{ verticalAlign: 'top'}} >
                                {item['SITC Category']}
                                </TableCell>
                            </TableRow>
                            
                            {item['SubCat'].map(subCatDetail => (
                            <>
                                <TableRow>
                                    <TableCell onClick={props.copy} rowSpan={subCatDetail['Item Cat 2'].length + 1}
                                    style={{ verticalAlign: 'top' }} id={subCatDetail['Item Cat 1']} ref={elRefs[subCatDetail['Item Cat 1']]}> 
                                        {subCatDetail['Item Cat 1']}
                                    </TableCell>
                                </TableRow>   

                                <>
                                {subCatDetail['Item Cat 2'].map(cat2 => (
                                    
                                    <TableRow>
                                        <TableCell onClick={props.copy}>
                                            {cat2}
                                        </TableCell>
                                    </TableRow>
                                    
                                ))}      
                                </>
                            </>
                            ))}
                        </>
                    ))}
                    </TableBody>
                </Table>
                </Paper>
            </div> 
            
        </div>
)

}