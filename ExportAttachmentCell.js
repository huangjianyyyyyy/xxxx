import React from 'react';
import {  PlusOutlined } from '@ant-design/icons';
import { Upload, Button, message } from 'antd';
import './ExportAttachmentCell.less';

class ExportAttachmentCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
     
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {rowIndex,value}=nextProps;  
    if (value!=prevState.value ||rowIndex != prevState.rowIndex) {
      return {
        value: value,
        rowIndex: nextProps.rowIndex,
      }
    }
    return null;
  }

  handleCancel = () => {
    this.setState({
      visible:false
    });
  }

  handleCancelWorkflowClick = () => {
    this.setState({
      workflowVisible:false,
    });
  }

  exportAttachment = () => {

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
    } else if (fileName.indexOf('.png') != -1 || fileName.indexOf('.jpg') != -1) {
      classObject = {
        className: 'AttachmentCell_file_list_img_bg',
        SortName: 'IMG',
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
    const props = {
      name: 'file',
      showUploadList:false,
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
    return (
      <div className="detailLayout">
        
        {/* {
         <div> 
            <Button 
              type="primary"
              size="small" 
              onClick={this.exportAttachment}
            >
              文档输出
            </Button>
            <Popover title="模板文件" content={
                <div style={{display:'flex'}}>
                    <Tag
                      closable
                      className="AttachmentCell_file_list_file_tag"
                      // onClose={this.removeFile.bind(this, file, i)}
                    >
                      <Avatar size={22} className={this.fileTypeClassName("模板文件.xlsx").className}>
                        {this.fileTypeClassName("模板文件.xlsx").SortName}
                      </Avatar>
                      <a className="AttachMentCell_file_list_file_text" style={{cursor:'ponter'}}>&nbsp;模板文件.xlsx</a>
                    </Tag>
                    <Button size="small" style={{margin:'5px 0 0 10px'}}>
                    下载
                    </Button>
                </div>
            }>
               <Button type="dashed" size="small" style={{marginLeft:'30px'}} icon={<FileTextOutlined />}></Button>
            </Popover>
            
         </div>
        } */}
        
        {
          <Upload {...props}>
            <Button type="dashed" size="small" icon={<PlusOutlined />}>添加模板文件</Button>
          </Upload>
        }

      </div>
      
    );
  }
}

export { ExportAttachmentCell };
