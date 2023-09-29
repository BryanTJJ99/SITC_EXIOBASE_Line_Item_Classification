import React, {Fragment} from "react"
import styles from "../styles/exiobase.module.css"
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

// Table imports
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";


// For DropDown
const spendCategoryLabels = require('../data/exiobase.json').map( x => x['Spend Category'])

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



function getStyles(name, category, theme) {
  return {
    fontWeight:
      category.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}


// for Table
let exiobaseData= require('../data/exiobase.json')

const useStyles = makeStyles(theme => ({
    root: {
      width: "100%",
      marginTop: theme.spacing(3),
      overflowX: "auto"
    },
    table: {
      minWidth: 700
    }
  }));

  

  export default function Exiobase(props) {
    
    // For dropdown
    const theme = useTheme();
    const [category, setCategory] = React.useState([]);
    
    const handleChange = (event) => {
      const value = event.target.value;
      setCategory(value);
      };
      
    const handleDelete = (value) => {
      setCategory((cats) => cats.filter((cat) => cat !== value))
    }
        



    const classes = useStyles();

    const filteredCat = category.length < 1 ? [] : exiobaseData.filter( x => 
      category.some(el => x['Spend Category'].includes(el) && el.length === x['Spend Category'].length))


    return (
        <div className = {styles.divContainer}>
          
            {/* Dropdown Portion */}
            <div className={styles.selectBar}>

                <div>
                    <FormControl sx={{ m: 5, width: 400  }} >
                        <InputLabel id="demo-multiple-chip-label">Exiobase</InputLabel>
                        <Select
                        labelId="demo-multiple-chip-label"
                        id="demo-multiple-chip"
                        multiple
                        value={category}
                        onChange={handleChange}
                        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.0 }}
                            style={{maxHeight: 600, overflowY: 'scroll'}}>
                            {selected.map((value) => (
                                <Chip key={value} label={value}   onDelete={() => handleDelete(value)} onMouseDown={(event) => {
                                  event.stopPropagation()
                                }}/>
                            ))}
                            </Box>
                        )}
                        MenuProps={MenuProps}
                        >
                        {spendCategoryLabels.map((label) => (
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

            </div>


            {/* Table Portion */}
            
            <div className={styles.table}>
                <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                    <TableRow>
                        <TableCell align="Center">Spend Category</TableCell>
                        <TableCell align="Center">Exiobase Spend Category</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody> 
                    {filteredCat.length >= 1 && filteredCat.map( item => (
                        <Fragment>
                            <TableRow>
                                <TableCell onClick={props.copy} rowSpan={item['Exiobase Spend Category'].length + 1}
                                style={{ verticalAlign: 'top'}}>
                                {item['Spend Category']}
                                </TableCell>
                            </TableRow>
                            {item['Exiobase Spend Category'].map(detail => (
                            <TableRow>
                                <TableCell onClick={props.copy}>{detail}</TableCell>
                            </TableRow>
                            ))}
                        </Fragment>
                    ))}
                    </TableBody>
                </Table>
                </Paper>
            </div> 



        </div>
    )

}
