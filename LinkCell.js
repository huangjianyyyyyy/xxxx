import React from 'react';
import { withTranslation } from 'react-i18next';
import {Cell} from '../../../maintable/FixedDataTableRoot';
import {PlusCircleFilled} from '@ant-design/icons';
import { connect } from 'react-redux';
import './LinkCell.less';
import { handleFocusSubRow } from '../../../maintable/actions/rowActions';
import LinkRowsModal from '../../section/modal/LinkRowsModal';
import {CredentialContext} from '../../../CredentialContext';
import {parseBoardViewId,ModalTypes, getSubLevel} from '../../../maintable/data/MainTableType';

//import {connect} from 'react-redux';

// import {
//     dealBoardLinkModal,
//   } from '../../../maintable/actions/cellActions';

//@connect(null, {dealBoardLinkModal})
@connect(
    null,
    { handleFocusSubRow }
  )
@withTranslation()
class LinkCell extends React.PureComponent {
    static contextType = CredentialContext;
    constructor(props) {
        super(props);
        this.state = {
            // boardId: props.value,
            isLoading: true,
            linkModalVisible: false,
            columnSettingLinkVisible: false,
            version: props.version,
            rowId:null
        };
    }

    componentDidMount(){
        if (this.props.value && !this._initialized) {
            const rows = this.props.data._dataset.getRowData(this.props.value);
            const bv = parseBoardViewId(this.props.data._boardId);
            if (!rows) {
                this.props.data._dataset.fetchBoardData(this.props.value, bv.viewId, this.setMenus, this.setLoading);
            }
        }
    }

    setLoading = (isLoading) => {
        this.setState({
          isLoading: isLoading,
        });
    }

    setMenus = (menus, isBoard, defaultBoard) => {
        let boardTitle;
        let boardColor;
        let boardId;
        if (defaultBoard) {
            boardTitle = defaultBoard.name;
            boardColor = defaultBoard.color;
            boardId = defaultBoard.boardId;
        }
        this.setState({
            boardTitle,
            boardColor,
            boardId,
            isLoading: false,
            board: defaultBoard
        });

    }

    addTreeRow =(subLevel,rowId) =>{
        let {data,rowIndex,handleFocusSubRow} =this.props;

            let parentRowId;
            if(subLevel==0){
                parentRowId = data.getRowKey(rowIndex);
                // if(group.rows[j].id === dataset._subRows.isSubAddRow){
                //   filteredIndexes.push({rowType: RowType.ADDROW, rowKey: '', groupKey: group.groupKey});
                // }
            }else if(data._subChilrenRows[rowIndex]) {
                parentRowId = data.getRowKey(rowIndex);
            }else{
                parentRowId = data.getRowKey(rowIndex.split('.')[0]);
            };
            handleFocusSubRow(data._boardId,{
                subRowKey:rowId,
                subRowIndex:rowIndex,
            })
            data._dataset.addSubAddRow(subLevel,rowId,parentRowId,data._boardId);
            return;
    }
    openLinkModal = (event) => {
        let {data,modalType,value,rowIndex,columnKey,handleUpdateModal,navigateBoardCallback,} =this.props;
        if (modalType==ModalTypes.RELATION && handleUpdateModal) {

            handleUpdateModal(true,data,rowIndex,null,true);
         
            return;
        }
        event.stopPropagation();
        let subLevel = getSubLevel(rowIndex); 
        let rowId = data.getRowKey(rowIndex);

        
        
        // const header = data.getLinkRowHeader(rowIndex);
        const row = data._dataset.getObjectAt(data._boardId, rowId);
        if (row) {
            const boardId = row[columnKey] && row[columnKey].value;
            this.addTreeRow(subLevel,rowId);
            if(!boardId){
                data._dataset.createLinkData(rowId,columnKey).then(res=>{

                    // if (navigateBoardCallback) {             
                    //     navigateBoardCallback(data._boardId, value, false, data, rowId, columnKey,header);
                    //     return;
                    // }
                    // this.setState({linkModalVisible:true,rowId:rowId});
                    // if (handleCellFocus) {
                    //     handleCellFocus(true);
                    // }
                })
            }else{
                // if (navigateBoardCallback) {             
                //     navigateBoardCallback(data._boardId, value, false, data, rowId, columnKey,header);
                //     return;
                // }
                // this.setState({linkModalVisible:true,rowId:rowId});
            }    
        }
       
    }

    columnSettingClosed = (boardId) => {
        this.setState({ columnSettingLinkVisible: false });
        if (boardId) {
            this.setState({ linkModalVisible:true });
        }
    }
    
    linkModalClosed = () => {
        this.setState({ linkModalVisible: false });
        if (this.props.handleCellFocus) {
            this.props.handleCellFocus(false);
        }
    }

    render() {
        const { t, width } = this.props;
        const {data, columnKey, rowIndex, siderWidth, isCellSelected,modalType} = this.props;
        const {linkModalVisible} = this.state;

        // const rows = data._dataset.getRowData(boardViewId);
        const header = data.getLinkRowHeader(rowIndex);
        let content;

        let value;

        let rowData = data.getObjectAt(rowIndex);
        let columnData = data.getColumn(columnKey);
        
        if(columnData){
            if (rowData && rowData[columnKey]) {
                value = rowData[columnKey].value;
            }
        }
        let rowId = data.getRowKey(rowIndex);
        return (
            <Cell className="LinkCell" isCellSelected={isCellSelected}>
                <div className="LinkCell_list_center" style={{width}} onClick={this.openLinkModal.bind(this)}>
                    <div className="link_cell_icon"><PlusCircleFilled className={modalType==ModalTypes.RELATION?"relation_add_icon":"LinkCell_link_add_icon"} /></div>
                    {value && (Boolean(value.count)) && (value.count +'项')} 
                </div>
                {rowId && <LinkRowsModal isShowBoardLinkModal={linkModalVisible} data={data} columnKey={columnKey} rowId={rowId} header={header} 
                    onClosed={this.linkModalClosed} boardId={data._boardId} siderWidth={siderWidth} isReadonly={this.props.isReadonly} />}
            </Cell>
        );
    }
}

export {LinkCell};