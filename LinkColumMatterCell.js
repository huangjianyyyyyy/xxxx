import React from 'react';
import { withTranslation } from 'react-i18next';
import {Cell} from '../../../maintable/FixedDataTableRoot';
import {
    PlusCircleFilled,
    CloseCircleFilled,
    CheckCircleFilled,
    ExclamationCircleFilled,
    FileExcelFilled,
    FilePptFilled,
    FileWordFilled,
    FileUnknownFilled,
    FilePdfFilled
} from '@ant-design/icons';
import {Tooltip, message} from 'antd';
import './LinkCell.less';
import {  DataVersionContext } from '../../../maintable/data/DataContext';
import CreateTableRowForm from '../../../maintable/create/CreateTableRowForm';
import {ModalTypes,parseBoardViewId} from '../../../maintable/data/MainTableType';
import {DataViewWrapper} from '../../../maintable/data/DataViewWrapper';

import moment from 'moment';

import {CredentialContext} from '../../../CredentialContext';
import {TaskStatus,TaskDateFormatStr} from '../taskcolumns/TaskColumns';


@withTranslation()
class LinkColumMatterCell extends React.PureComponent {
    static contextType = CredentialContext;
    constructor(props) {
        super(props);
        this.state = {
            version: props.version,
            data:null
        };
        this.textColor='#666';
        this.isTitleColumn=null;
    }

    componentDidMount(){

       
    }

    handleCellFocus = (focused) => {
        if (this.props.onCellFocus) {
            this.props.onCellFocus(
            this.props.rowIndex,
            this.props.columnKey,
            focused
            );
        }
    }

    openLinkModal =  (event) => {
        event.stopPropagation();
        const {data, rowIndex, columnKey,modalType,isReadonly,handleUpdateModal} = this.props;
        if(modalType==ModalTypes.RELATION && handleUpdateModal){
            // if(handleUpdateModal){
                handleUpdateModal(true,data,rowIndex,null,true);
            // }
            return;
        }  
 
        let rowId = data.getRowKey(rowIndex);
        data._dataset.addRowLinkToBoard(data._boardId,columnKey,rowId,this.getLinkBoard).then(async res=>{
            let bv = parseBoardViewId(res.linkBoardID);
            let boardId = bv.boardId+'-'+bv.viewId;
            const dataModelList = res.dataModelList[0];
            const linkedData  = dataModelList && dataModelList.linkedData;
            //rowid有值，属性弹窗弹窗
            if(linkedData && linkedData.destID){ 
                this.props.handleUpdateModal(true,this.props.data,linkedData.destID,ModalTypes.COLUMNNAMEMATTER,true)
               
            }else{
                if(isReadonly) {
                    message.warning('暂无权限');
                    return;
                } 
                if(!data._dataset._columns[boardId]){
                    const colums = await data._dataset.listColumnsByBoardID(boardId);
                }       
                this.setState({
                    data:new DataViewWrapper({
                            boardId:boardId,
                            dataset:data._dataset, 
                            indexMap:[],
                            isFilterRequired:false
                        }),
                },()=>{
                    this.child.showModal();
                });
            }

            if (this.handleCellFocus) {
                this.handleCellFocus(true);
            }
        });
    }

    onRef = (ref) => {
        this.child = ref;
    };

    getAlertIcon = (value) => {
        let statusID = value && value.statusID;
        if (statusID*1===TaskStatus.CLOSED_STATUS){
            this.textColor='green';
            return <CheckCircleFilled style={{ fontSize: '16px', color: 'green', alignContent:"center" }} />;
        }else if (statusID*1===TaskStatus.CANCEL_STATUS) {
            this.textColor='#ffc107';
          return <ExclamationCircleFilled style={{ fontSize: '16px', color:  '#ffc107' , alignContent:"center" }} />;
        }else if(statusID*1===TaskStatus.STARTED_STATUS){
            this.textColor='blue';

            let planStart = value.planStart, 
                planEnd = value.planEnd && moment(value.planEnd, TaskDateFormatStr.DATE_FORMAT_STR), 
                today = moment({hour: 0});
            if (planStart && planEnd && (today > planEnd)) {
                return <Tooltip placement="top" title={'已逾期'+today.diff(planEnd, 'days')+'天'} arrowPointAtCenter>
                    <ExclamationCircleFilled style={{ fontSize: '16px', color:  'red' , alignContent:"center" }} />
                </Tooltip>
                 
            }
        }else if(statusID*1===TaskStatus.NOT_STARTED_STATUS){
            let planStart = value.planStart && moment(value.planStart, TaskDateFormatStr.DATE_FORMAT_STR), 
                planEnd = value.planEnd, 
                today = moment({hour: 0});
            if (planStart && planEnd && (today > planStart)) {
                return <Tooltip placement="top" title={'已逾期'+today.diff(planStart, 'days')+'天'} arrowPointAtCenter>
                    <ExclamationCircleFilled style={{ fontSize: '16px', color:  'red' , alignContent:"center" }} />
                </Tooltip>
                 
            }
        }
        return null;
    };
    deleteData =(e,rowData)=>{
        e.stopPropagation();
        e.preventDefault();
        const {data, rowIndex, columnKey} = this.props;
        let id;
        if(rowData && rowData.id){
            id = rowData.id;     
        }else{
            let rowData = data.getObjectAt(rowIndex)[columnKey];
            id = rowData.id;
        }
        data._dataset.deleteData(id);
        data.setObjectAt(
            rowIndex,
            columnKey,
            '',
            true
        );
    }
    
    fileTypeClassName = (fileName) => {
        let classObject = {};
        if (fileName.indexOf('.xlsx') != -1 || fileName.indexOf('.xls') != -1) {
            classObject = {
                className: 'AttachmentCell_file_list_excel_bg',
                SortName: 'X',
            };
        } else if (fileName.indexOf('.pptx') != -1 || fileName.indexOf('.ppt') != -1) {
            classObject = {
                className: 'AttachmentCell_file_list_ppt_bg',
                SortName: 'P',
            };
        } else if (fileName.indexOf('.docx') != -1 || fileName.indexOf('.doc') != -1) {
            classObject = {
                className: 'AttachmentCell_file_list_word_bg',
                SortName: 'W',
            };
        } else if (fileName.indexOf('.pdf') != -1) {
            classObject = {
                className: 'AttachmentCell_file_list_pdf_bg',
                SortName: 'PDF',
            };
        } else {
            classObject = {
                className: 'AttachmentCell_file_list_other_bg',
                SortName: '?',
            };
        }
        return classObject;
    };
    render() {
        const {data, columnKey, rowIndex,isReadonly, isCellSelected, t, width,updateParentValue} = this.props;
        let rowId = data.getRowKey(rowIndex);
        let value,title;
        
        let rowData = data.getObjectAt(rowIndex);
        let columnData = data.getColumn(columnKey);
        
        if(columnData){
            if (rowData && rowData[columnKey]) {
                value = rowData[columnKey].value;
                let isTitleColumn = data._dataset._columns[data._boardId].filter(column=>column.isTitle);
                title = isTitleColumn && rowData[isTitleColumn[0].id].value +'-'+ columnData.name +'-跟踪项';
            }
        }
        let fileList= value && value.attachment;
        
        return (
            <Cell className="LinkCell" >
                <div className='columnNameMatter' onClick={this.openLinkModal.bind(this)}>
                    {value && this.getAlertIcon(value)}
                    {value && <span style={{color:this.textColor,margin:'0 5px'}}> {value.statusName}</span> }
                    {fileList && fileList.length > 0 &&
                        (
                        <Tooltip placement="top" title={fileList[0].filename} arrowPointAtCenter>
                        {(this.fileTypeClassName(fileList[0].filename).SortName == 'X' && (
                            <FileExcelFilled className="AttachmentCell_file_list AttachmentCell_file_list_excel" />
                        )) ||
                            (this.fileTypeClassName(fileList[0].filename).SortName == 'P' && (
                            <FilePptFilled className="AttachmentCell_file_list AttachmentCell_file_list_ppt" />
                            )) ||
                            (this.fileTypeClassName(fileList[0].filename).SortName == 'W' && (
                            <FileWordFilled className="AttachmentCell_file_list AttachmentCell_file_list_word" />
                            )) ||
                            (this.fileTypeClassName(fileList[0].filename).SortName == 'PDF' && (
                            <FilePdfFilled className="AttachmentCell_file_list AttachmentCell_file_list_pdf" />
                            )) ||
                            (this.fileTypeClassName(fileList[0].filename).SortName == '?' && (
                            <FileUnknownFilled className="AttachmentCell_file_list AttachmentCell_file_list_other" />
                            ))}
                        </Tooltip>
                    )}
                   {value && value.statusID && !isReadonly && <CloseCircleFilled  className='clearnIcon' onClick={(e)=>{this.deleteData(e,rowData[columnKey])}}/>}
                   {(!value || JSON.stringify(value) =='{}') && !isReadonly && <PlusCircleFilled className='clearnIcon' style={{right: '60px'}}/>}
                </div>
                { data && <DataVersionContext.Consumer>
                    {({ data }) => 
                        <CreateTableRowForm 
                            onRef={this.onRef} 
                            data={this.state.data} 
                            type={ModalTypes.COLUMNNAMEMATTER} 
                            rowId={rowId}
                            title = {title}
                            columnKey={columnKey}
                    />}
                </DataVersionContext.Consumer>}
                  
            </Cell>
            
        );
    }
}

export {LinkColumMatterCell};