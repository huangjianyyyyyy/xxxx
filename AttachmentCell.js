import React,{ createRef}  from 'react';
import { Popover, Tooltip, Tag, Avatar, Button, message } from 'antd';
import {
  FileExcelFilled,
  FilePptFilled,
  FileWordFilled,
  FileUnknownFilled,
  FileImageFilled,
  PlusCircleFilled,
  CloseCircleFilled,
  FilePdfFilled,
  CloudDownloadOutlined
} from '@ant-design/icons';
// import 'moment/locale/zh-cn';
import { Cell } from '../../../maintable/FixedDataTableRoot';
import { getCellSelectedStyle, getCellPopupHeight } from './CellProperties';
import { ColumnType,acceptFileType } from '../../../maintable/data/MainTableType';
import './AttachmentCell.less';
import { withTranslation } from 'react-i18next';
import { createUploadLink } from 'apollo-upload-client';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import onpremclient from '../../../onprem.config.js'


function getRowValue(value){
  let rowValue;
  try {
      if(typeof(value)=='object'&&value){
        rowValue = value;
      }else{
          rowValue = JSON.parse(value);
          if(typeof(rowValue)!='object'|| !value){
            rowValue = [];
          }
      }
     
  } catch (error) {
    rowValue =[];
  }
  return rowValue;
};
@withTranslation()
class AttachmentCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: getRowValue(props.value),
      visible: false,
      selectedStyle: {},
      rowId:props.rowId,
      column:null,
    };
    this.client=null;
    this.inputRef = createRef();
  }
  componentDidMount(){
    const {rowId,columnKey,data}=this.props;
    let column = data.getColumn(columnKey);
    let formData = new FormData();
    formData.append('rowID', rowId);
    formData.append('columnID', columnKey);
    formData.append('uploadbyID', data.getCurrentUser().id);
  
    const uploadLink = createUploadLink({ 
      uri: onpremclient.onprem_appsync_graphqlEndpoint, 
      FormData,
      headers:{
        userid: localStorage.getItem('CurrentUserId')||0,
        Authorization: localStorage.getItem('token')||0,
      }
    });
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: uploadLink
    })
    this.setState({
      column:column
    })
  }
  componentDidUpdate(prevProps, prevState) {
    let {value,rowIndex}=this.props; 

    if (value != prevProps.value ||  rowIndex != prevState.rowIndex) {
      this.setState({
        files: getRowValue(value),
        rowIndex:rowIndex,
      });
    }
  }
  handleVisibleChange = (visible) => {
    if (visible) {
      this.setState({
        selectedStyle: getCellSelectedStyle(),
      });
      this.props.handleCellEdit(ColumnType.ATTACHMENT, getCellPopupHeight(ColumnType.ATTACHMENT));
    } else {
      this.setState({
        selectedStyle: {},
      });
      this.props.handleCellEdit();
    }
    this.setState({ visible });
  };

  uploadFile=({ target: { files } }) =>{
    const {rowId,columnKey,data}=this.props;
    let fileType = acceptFileType();
    let FileElementInput={
      rowID: rowId,
      columnID: columnKey,
      filename: [],
      uploadbyID: data.getCurrentUser().id
    }
    let fileparts = [];
    files = Object.values(files);
    if(files && files.length>0){
      files.map((item,i)=>{
        if(fileType.indexOf(item.type)!=-1){
          FileElementInput.filename.push(encodeURIComponent(item.name));
          fileparts.push(item);
        }        
      })

      data._dataset.getUploadProps(this.client,FileElementInput, fileparts).then(res=>{
        if(res && res.length>0){
          message.success("上传成功");
          let arrTest = [];
          res.map((item,index)=>{
            arrTest.push({
              filename:files[index].name,
              id:item
            })
          })
          
          this.setState((prevState, props)=>({
            // files: prevState.files.concat(arrTest)
          }),()=>{
            this.props.handleChange(JSON.stringify(this.state.files), false);
          });
          // if( i == (files.length-1) ){
            this.setState({
              selectedStyle: {},
              visible: false,
            });
            this.inputRef.current.value='';
          // }   
        } else{
          message.error("上传失败");
        }  
      })
    }
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
    } else if (fileName.indexOf('.png') != -1 || fileName.indexOf('.jpg') != -1) {
      classObject = {
        className: 'AttachmentCell_file_list_img_bg',
        SortName: 'IMG',
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

  removeFile = (file, index) => {
    const {rowIndex,columnKey,data}=this.props;
    let files = this.state.files; 
    let allFiles = [];
    files.forEach((file) => {
      if (file.id != '') {
        allFiles.push(file);
      }
    });
    allFiles.splice(index, 1);
    this.setState({
      visible: false,
      files: allFiles,
    });
    let dataId = data.getObjectAt(rowIndex)[columnKey].id;
    data._dataset.deleteFile(file.id,JSON.stringify(allFiles),dataId).then(res=>{
      if(res){
        data.setObjectAt(rowIndex,columnKey,allFiles,true);
      }else{
        message.warning('删除失败')
      }
     
    })

   
  };

  removeAllFiles = () => {
    this.setState({
      visible: false,
      files: [],
    });
    this.props.handleChange(JSON.stringify([]), true);
  };
  downFile=(file)=>{
    const {data}=this.props;
    data._dataset.downloadFile(file.id).then(res=>{
      if(res){
        window.open(res)
        message.warning('下载成功')
      }else{
        message.warning('下载失败')
      }
     
    })

  }
  render() {
    const { t,isReadonly } = this.props;
    const { selectedStyle, files,column } = this.state;
  
    let fileList = files ? files : [];
    //循环判断条件使用（如果附件数量>2,cell显示一个附件剩余数量+X;否则附件数量<2，就显示对应1个或2个）
    let foreachCount = fileList.length > 2 ? 1 : fileList.length;
    let addIconMarginRight = {
      marginRight: fileList.length > 0 ? '15px' : '-15px',
    };
    let fileType = acceptFileType().join(',')
    return (
      <Cell className="AttachmentCell" style={selectedStyle} isCellSelected={this.props.isCellSelected}>
        <Popover 
         disabled={this.props.isReadonly}
         arrowPointAtCenter
         trigger="click"
         placement="bottom" 
         visible={this.state.visible}
         overlayStyle={{ width: 300}}
         getPopupContainer={(trigger) => this.props.container ? this.props.container : trigger.parentElement}
         onVisibleChange={this.handleVisibleChange}
         overlayClassName='attachment_popover'
         content={
            <div style={{ pointerEvents: 'visible'}}>
              <div className="AttachmentCell_file_list_div">
                {fileList.map((file, i) => (
                  <span key={i}>
                    {/* {!this.props.isReadonly && ( */}
                      <div style={{display:'flex'}}>
                          <Tag
                            closable = {!isReadonly}
                            className="AttachmentCell_file_list_file_tag"
                            onClose={this.removeFile.bind(this, file, i)}
                          >
                            <Avatar size={32} className={this.fileTypeClassName(file.filename).className} style={{margin:"auto"}}>
                              {this.fileTypeClassName(file.filename).SortName}
                            </Avatar>
                            <div>
                              <a className="AttachMentCell_file_list_file_text" style={{cursor:'ponter'}} onClick={() => this.downFile(file)}>&nbsp;{file.filename}</a><br />
                              <span style={{color:"#bfbfbf"}}>{file.time}&nbsp;&nbsp;{file.user}</span>
                            </div>
                          </Tag>
                          {column && column.columnDownload && <Tooltip title="点击下载"><Button type="link" icon={<CloudDownloadOutlined/>} onClick={() => this.downFile(file)} style={{margin:'10px'}}>
                          </Button></Tooltip>}
                      </div>
                    {/* )} */}
                    {/* {this.props.isReadonly && (
                      <div>
                        <Avatar size={22} className={this.fileTypeClassName(file.filename).className}>
                          {this.fileTypeClassName(file.filename).SortName}
                        </Avatar>
                        <span className="AttachMentCell_file_list_file_text">&nbsp;{file.filename}</span>
                      </div>
                    )} */}
                  </span>
                ))}
              </div>
              {!this.props.isReadonly && (       
                <div style={{ width: '100%',position:"relative" }}>
                  <input type="file" multiple="multiple" ref={this.inputRef} accept={fileType}   onChange={this.uploadFile}  className='AttachmentCell_file_list_upload_input' />
                  <Button type="primary" className="AttachmentCell_file_list_upload_btn">
                  {t('ColumnCell.AttachmentCell.upload')}
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div className="AttachmentCell_file_list_center">
            {!this.props.isReadonly && (
              <PlusCircleFilled className="AttachmentCell_file_add_icon" style={addIconMarginRight} />
            )}
            {fileList.length > 0 &&
              fileList.map(
                (file, i) =>
                  i < foreachCount && (
                    <Tooltip key={i} placement="top" title={file.filename} arrowPointAtCenter>
                      {(this.fileTypeClassName(file.filename).SortName == 'X' && (
                        <FileExcelFilled className="AttachmentCell_file_list AttachmentCell_file_list_excel" />
                      )) ||
                        (this.fileTypeClassName(file.filename).SortName == 'P' && (
                          <FilePptFilled className="AttachmentCell_file_list AttachmentCell_file_list_ppt" />
                        )) ||
                        (this.fileTypeClassName(file.filename).SortName == 'W' && (
                          <FileWordFilled className="AttachmentCell_file_list AttachmentCell_file_list_word" />
                        )) ||
                        (this.fileTypeClassName(file.filename).SortName == 'PDF' && (
                          <FilePdfFilled className="AttachmentCell_file_list AttachmentCell_file_list_pdf" />
                        )) ||
                        (this.fileTypeClassName(file.filename).SortName == 'IMG' && (
                          <FileImageFilled className="AttachmentCell_file_list AttachmentCell_file_list_img" />
                        )) ||
                        (this.fileTypeClassName(file.filename).SortName == '?' && (
                          <FileUnknownFilled className="AttachmentCell_file_list AttachmentCell_file_list_other" />
                        ))}
                    </Tooltip>
                  )
              )}

            {fileList.length > 2 && (
              <Tooltip title={fileList.map((file, i) => i > 0 && <div key={i}>{file.filename}</div>)}>
                <div className="AttachmentCell_file_more">
                  <div className="box-con"></div>
                  <span className="AttachmentCell_file_more_count">+{fileList.length - 1}</span>
                </div>
              </Tooltip>
            )}

            <CloseCircleFilled className="AttachmentCell_file_remove_icon" onClick={this.removeAllFiles} />
          </div>
        </Popover>
      </Cell>
    );
  }
}

export { AttachmentCell };