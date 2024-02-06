import React from 'react';
// import 'antd/dist/antd.css';
// import 'moment/locale/zh-cn';
import {TableContext} from '../../../maintable/data/DataContext';
import TextCell from './TextCell';
import NumberCell from './NumberCell';
import {SelectCell} from './SelectCell';
import {DateCell} from './DateCell';
import {StatusCell} from './StatusCell';
import {BraftEditorCell} from './BraftEditorCell';
import {AttachmentCell} from './AttachmentCell';
import {CheckBoxCell} from './CheckBoxCell';
import {DateTimeSlotCell} from './DateTimeSlotCell';
import {PeopleCell} from './PeopleCell';
import {FlagCell} from './FlagCell';
import {ExportAttachmentCell} from './ExportAttachmentCell';
import {FictitiousPeopleCell} from './FictitiousPeopleCell';

import {CredentialContext} from '../../../CredentialContext';
// import {MatterEditableCheck} from '../../../maintable/data/MatterPermissionCheck';

class TableCell extends React.Component {
  static contextType = CredentialContext;
  constructor(props) {
    super(props);
  }


  initCellHashTable(table) {
    const cellHashTable = {
      PEOPLE: (
        <PeopleCell
          isSingle = {true}
          columnKey={table.columnKey}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          data={table.data}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellFocus={table.handleCellFocus}
          filterInputValue={table.filterInputValue}
          rowId={table.rowId}
        />
      ),
      PEOPLESEARCH: (
        <PeopleCell
          isSingle = {false}
          columnKey={table.columnKey}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          data={table.data}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellFocus={table.handleCellFocus}
          filterInputValue={table.filterInputValue}
          rowIndex={table.rowIndex}
          isReadonly= {this.props.isReadonly}
          rowId={table.rowId}
        />
      ),
      PEOPLESINGLE: (
        <PeopleCell
          isSingle = {true}
          columnKey={table.columnKey}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          data={table.data}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellFocus={table.handleCellFocus}
          filterInputValue={table.filterInputValue}
          rowId={table.rowId}
        />
      ),
      PEOPLESEARCHSINGLE: (
        <PeopleCell
          isSingle = {true}
          columnKey={table.columnKey}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          data={table.data}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellFocus={table.handleCellFocus}
          filterInputValue={table.filterInputValue}
          rowIndex={table.rowIndex}
          isReadonly= {this.props.isReadonly}
          rowId={table.rowId}
        />
      ),
      // MULTIPERSONCOLUMN: (
      //   <PeopleSimpleCell
      //     isSingle = {true}
      //     columnKey={table.columnKey}
      //     value={table.value}
      //     handleChange={table.handleChange}
      //     handleKey={table.handleKey}
      //     data={table.data}
      //     container={this.props.container}
      //     handleCellEdit={table.handleCellEdit}
      //     handleCellFocus={table.handleCellFocus}
      //     filterInputValue={table.filterInputValue}
      //     rowIndex={table.rowIndex}
      //     isReadonly= {this.props.isReadonly}
      //     rowId={table.rowId}
      //   />
      // ),
      // SINGLEPERSONCOLUMN: (
      //   <PeopleSimpleCell
      //     isSingle = {false}
      //     columnKey={table.columnKey}
      //     value={table.value}
      //     handleChange={table.handleChange}
      //     handleKey={table.handleKey}
      //     data={table.data}
      //     container={this.props.container}
      //     handleCellEdit={table.handleCellEdit}
      //     handleCellFocus={table.handleCellFocus}
      //     filterInputValue={table.filterInputValue}
      //     rowIndex={table.rowIndex}
      //     isReadonly= {this.props.isReadonly}
      //     rowId={table.rowId}
      //   />
      // ),
      TEXT: (
        <TextCell
          data={table.data}
          value={table.value}
          isHeaderOrFooter={table.isHeaderOrFooter}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          rowId={table.rowId}
          isReadonly= {this.props.isReadonly}
        />
      ),
      NUMBER: (
        <NumberCell 
          data={table.data}
          value={table.value} 
          handleChange={table.handleChange} 
          handleKey={table.handleKey} 
          rowId={table.rowId}
          isReadonly= {this.props.isReadonly}
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
        />
      ),
      SELECT: (
        <SelectCell
          data={table.data}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellEditEnd={table.handleCellEditEnd}
          handleHide={table.handleHide}
          rowId={table.rowId}
          isReadonly= {this.props.isReadonly}
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
        />
      ),
      DATE: (
        <DateCell
          columnKey={table.columnKey}
          data={table.data}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellEditEnd={table.handleCellEditEnd}
          isReadonly={this.props.isReadonly}
          // mouseIn={table.mouseIn}
          cellClassName={table.cellClassName}
          filterInputValue={table.filterInputValue}
          modaltype={this.props.modalType}
          rowIndex={table.rowIndex}
          rowId={table.rowId}
          alertType={table.alertType}
        />
      ),
      STATUS: (
        <StatusCell
          isReadonly={this.props.isReadonly}
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
          data={table.data}
          value={table.value}
          color={table.color}
          handleChange={table.handleChange}
          handleCellEdit={table.handleCellEdit}
          handleCellEditEnd={table.handleCellEditEnd}
          handleKey={table.handleKey}
          displayValue={table.displayValue}
          container={this.props.container}
          modaltype={this.props.modalType}
          isColumnReadonly={this.props.isColumnReadonly}
        />
      ),
      RICHTEXT: (
        <BraftEditorCell 
          data={table.data}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellEditEnd={table.handleCellEditEnd}
          isReadonly= {this.props.isReadonly}
          isCellSelected={this.props.isCellSelected}
          width={this.props.width}
          cardMode={this.props.cardMode}
          rowId={table.rowId}
          handleCellFocus={table.handleCellFocus}
          columnKey={table.columnKey}
          rowIndex={table.rowIndex}
        />
      ),
      ATTACHMENT: (
        <AttachmentCell
          data={table.data}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          container={this.props.container}
          isReadonly= {this.props.isReadonly}
          handleCellEdit={this.props.handleCellEdit}
          handleCellEditEnd={this.props.handleCellEditEnd}
          isCellSelected={this.props.isCellSelected}
          rowId={table.rowId}
          columnKey={table.columnKey}
          rowIndex={table.rowIndex}
        />
      ),
      CHECKBOX: (
        <CheckBoxCell
          modalType={this.props.modalType}
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
          data={table.data}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          isReadonly= {this.props.isReadonly}
          rowId={table.rowId}
          container={this.props.container}
        />
      ),
      DATETIMESLOT: (
        <DateTimeSlotCell 
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
          data={table.data}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellEditEnd={table.handleCellEditEnd}
          // mouseIn={table.mouseIn}
          cellClassName={table.cellClassName}
          filterInputValue={table.filterInputValue}
          rowId={table.rowId}
          isReadonly= {this.props.isReadonly}
        />
      ),
      // COLUMNDETAIL:(
      //   <DetailCell 
      //     rowIndex={table.rowIndex}
      //     columnKey={table.columnKey}
      //     data={table.data}
      //     value={table.value}
      //     cellClassName={table.cellClassName}
      //     rowId={table.rowId}
      //      openWorkflowForm={this.props.openWorkflowForm}
      //     isReadonly= {this.props.isReadonly}
      //     onTabCreate={this.props.onTabCreate}
      //     onTabClose={this.props.onTabClose}
      //   />
      // ),
      FLAG:(
        <FlagCell 
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
          data={table.data}
          value={table.value}
          cellClassName={table.cellClassName}
          rowId={table.rowId}
          isReadonly= {this.props.isReadonly}
        />
      ),
      SINGLEFICTITIOUSPERSON: (
        <FictitiousPeopleCell
          isSingle = {true}
          columnKey={table.columnKey}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          data={table.data}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellFocus={table.handleCellFocus}
          filterInputValue={table.filterInputValue}
          rowIndex={table.rowIndex}
          isReadonly= {this.props.isReadonly}
          rowId={table.rowId}
        />
      ),
      FICTITIOUSPERSON: (
        <FictitiousPeopleCell
          isSingle = {false}
          columnKey={table.columnKey}
          value={table.value}
          handleChange={table.handleChange}
          handleKey={table.handleKey}
          data={table.data}
          container={this.props.container}
          handleCellEdit={table.handleCellEdit}
          handleCellFocus={table.handleCellFocus}
          filterInputValue={table.filterInputValue}
          rowIndex={table.rowIndex}
          isReadonly= {this.props.isReadonly}
          rowId={table.rowId}
        />
      ),
      EXPORTATTACHMENT:(
        <ExportAttachmentCell 
          rowIndex={table.rowIndex}
          columnKey={table.columnKey}
          data={table.data}
          value={table.value}
          cellClassName={table.cellClassName}
          rowId={table.rowId}
          isReadonly= {this.props.isReadonly}
        />
      ),
    };
    // if(table.type === ColumnType.PEOPLESEARCH){
    //   return cellHashTable['FICTITIOUSPERSON'];
    // }else if( table.type === ColumnType.PEOPLESEARCHSINGLE){
    //   return cellHashTable['SINGLEFICTITIOUSPERSON'];
    // }
    return cellHashTable[table.type];
  }
  render() {
    return <TableContext.Consumer>{(table) => this.initCellHashTable(table)}</TableContext.Consumer>;
  }
}

export {TableCell};
