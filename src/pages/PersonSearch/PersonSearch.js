import React, { Component } from 'react';
import { Form, DatePicker, Row, Col, Card, Input, Button, Upload, Icon, Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import moment from 'moment'
import styles from './PersonSearch.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
const additional = [
  {
    local: 'search.select.match',
    prefix: 'matchLevel',
    placeholder: formatMessage({id: 'search.select.match.placeholder'}),
    value: ['HIGHEST', 'HIGHER', 'GENERAL', 'LOWER'],
  },
  {
    local: 'search.select.gender',
    prefix: 'gender',
    placeholder: formatMessage({id: 'search.select.gender.placeholder'}),
    value: ['MALE', 'FEMALE'],
  },
  {
    local: 'search.select.glasses',
    prefix: 'glasses',
    placeholder: formatMessage({id: 'search.select.glasses.placeholder'}),
    value: ['WITH', 'NONE'],
  },
  {
    local: 'search.select.age',
    prefix: 'personAgeLevel',
    placeholder: formatMessage({id: 'search.select.age.placeholder'}),
    value: ['OLD', 'MIDDLE_AGED', 'YOUNG', 'CHILDHOOD'],
  }
];

class PersonSearch extends Component {
  constructor(props) {
    super(props);
    this.imageToken = '';
  }

  handleUpload = () => {

  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { form } = this.props;
    const formValues = form.getFieldsValue();
    const {
      gender = null,
      glasses = null,
      matchLevel = null,
      personAgeLevel = null,
      name,
      range: [startDate, endDate],
    } = formValues;
    const { dispatch } = this.props;
    if (!name && !this.imageToken) {
      message.error(formatMessage({id: 'search.error.name'}))
      return;
    }
    dispatch({
      type: 'search/findPerson',
      payload: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        name,
        imageToken: this.imageToken,
        matchLevel,
        gender,
        glasses,
        personAgeLevel,
        fromIndex: 1,
        endIndex: 100,
        queryEndTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      }
    })
  };

  handleSelect = (prefix, e) => {
    console.log('handle-select', e)
  };

  renderUpload = () => {
    const { searching } = this.props;
    return (
      <Upload
        disabled={searching}
        onChange={this.handleUpload}
      >
        <Icon type="upload" />{formatMessage({id: 'upload'})}
      </Upload>
    );
  };

  renderSelect = () => {
    const { form: { getFieldDecorator }, searching } = this.props;
    return additional.map(item => (
      <Col xs={12} sm={12} md={8} lg={3} key={item.prefix}>
        <FormItem>
          {getFieldDecorator(item.prefix)(
            <Select
              onChange={(value)=>this.handleSelect(item.prefix, value)}
              placeholder={item.placeholder}
              disabled={searching}
              placeholderTextColor="#333"
              style={{ width: 140 }}
              allowClear
              showSearch
            >
              {
                item.value.map(option =>
                  <Option key={option}>
                    {formatMessage({id: `${item.local}.${option.toLowerCase()}`})}
                  </Option>)
              }
            </Select>)}
        </FormItem>
      </Col>));
  };

  renderForm = () => {
    const { form: { getFieldDecorator }, searching } = this.props;
    const rowGutter = { xs: 8, sm: 16, md: 24, lg: 32 };
    return (
      <div className={styles.searchForm}>
        <Form onSubmit={this.handleSubmit} layout='inline'>
          <Row gutter={rowGutter}>
            <Col xs={24} sm={24} md={24} lg={8}>
              <FormItem
                label={formatMessage({id: 'label.time'})}
              >
                {getFieldDecorator('range', {
                  initialValue: [moment(new Date()), moment(new Date())],
                })(
                  <RangePicker
                    allowClear={false}
                  />
                )}
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={16} lg={8}>
              <FormItem>
                {getFieldDecorator('name')(
                  <Input
                    disabled={searching}
                    addonAfter={this.renderUpload()}
                    placeholder={formatMessage({id: 'search.input.name.upload'})}
                  />
                )}
              </FormItem>
            </Col>
            <Col xs={24} sm={16} md={8} lg={8}>
              <FormItem>
                <Button type="primary" htmlType="submit">
                  {formatMessage({id: 'search'})}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Row type="flex" justify="start" gutter={8}>
          {this.renderSelect()}
        </Row>
      </div>
    );
  };

  render() {
    return (
      <Card>
        {this.renderForm()}
      </Card>
    );
  }
}
const FormPersonSearch = Form.create()(PersonSearch);
export default connect(({ search, loading }) => ({
  search,
  searching: loading.effects['search/findPerson'],
}))(FormPersonSearch);
