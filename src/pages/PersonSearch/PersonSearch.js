import React, { Component } from 'react';
import {
  Form,
  DatePicker,
  Row,
  Col,
  Card,
  Input,
  Button,
  Upload,
  Icon,
  Select,
  message,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import styles from './PersonSearch.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
const additional = [
  {
    local: 'search.select.match',
    prefix: 'matchLevel',
    placeholder: formatMessage({ id: 'search.select.match.placeholder' }),
    value: ['HIGHEST', 'HIGHER', 'GENERAL', 'LOWER'],
  },
  {
    local: 'search.select.gender',
    prefix: 'gender',
    placeholder: formatMessage({ id: 'search.select.gender.placeholder' }),
    value: ['MALE', 'FEMALE'],
  },
  {
    local: 'search.select.glasses',
    prefix: 'glasses',
    placeholder: formatMessage({ id: 'search.select.glasses.placeholder' }),
    value: ['WITH', 'NONE'],
  },
  {
    local: 'search.select.age',
    prefix: 'personAgeLevel',
    placeholder: formatMessage({ id: 'search.select.age.placeholder' }),
    value: ['OLD', 'MIDDLE_AGED', 'YOUNG', 'CHILDHOOD'],
  },
];

class PersonSearch extends Component {
  constructor(props) {
    super(props);
    this.firstSelect = null; // 日期选择器第一次选择的日期，2次日期选完后清空，用于设置disabledDate
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'search/stopFindPerson' });
  }

  onChange = (field, value) => {
    this.changeCondition({
      [field]: value,
    });
  };

  changeCondition = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'search/changeConditions',
      payload,
    });
  };

  handleUpload = () => {};

  disabledDate = date => {
    if (this.firstSelect) {
      return (
        date > moment().endOf('day') ||
        date.diff(this.firstSelect, 'days') < -7 ||
        date.diff(this.firstSelect, 'days') > 7
      );
    }
    return date > moment().endOf('day');
  };

  onCalendarChange = dates => {
    if (dates.length === 1) {
      [this.firstSelect] = dates;
    } else {
      this.firstSelect = null;
      this.changeCondition({
        startDate: moment(dates[0]).format('YYYY-MM-DD'),
        endDate: moment(dates[1]).format('YYYY-MM-DD'),
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      search: {
        searching,
        params: { name, imageToken },
      },
      dispatch,
    } = this.props;
    if (searching) {
      dispatch({ type: 'search/stopFindPerson' });
    } else {
      if (!name && !imageToken) {
        message.error(formatMessage({ id: 'search.error.name' }));
        return;
      }
      dispatch({ type: 'search/clearData' });
      dispatch({ type: 'search/startFindPerson' });
    }
  };

  // 过滤搜索结果
  handleSelect = (prefix, value) => {
    let valueEnd = value;
    if (value === undefined) {
      valueEnd = null;
    }
    this.changeCondition({
      [prefix]: valueEnd,
    });
  };

  renderUpload = () => {
    const { searching } = this.props;
    return (
      <Upload disabled={searching} onChange={this.handleUpload}>
        <Icon type="upload" />
        {formatMessage({ id: 'upload' })}
      </Upload>
    );
  };

  renderSelect = () => {
    const {
      form: { getFieldDecorator },
      search: { searching },
    } = this.props;
    return additional.map(item => (
      <Col xs={12} sm={12} md={8} lg={3} key={item.prefix}>
        <FormItem>
          {getFieldDecorator(item.prefix)(
            <Select
              onChange={value => this.handleSelect(item.prefix, value)}
              placeholder={item.placeholder}
              disabled={searching}
              placeholderTextColor="#333"
              style={{ width: 140 }}
              allowClear
              showSearch
            >
              {item.value.map(option => (
                <Option key={option}>
                  {formatMessage({ id: `${item.local}.${option.toLowerCase()}` })}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
      </Col>
    ));
  };

  renderForm = () => {
    const {
      form: { getFieldDecorator },
      search: { searching },
    } = this.props;
    const rowGutter = { xs: 8, sm: 16, md: 24, lg: 32 };
    return (
      <div className={styles.searchForm}>
        <Form onSubmit={this.handleSubmit} layout="inline">
          <Row gutter={rowGutter}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={6}>
              <FormItem label={formatMessage({ id: 'label.time' })}>
                {getFieldDecorator('range', {
                  initialValue: [moment(new Date()), moment(new Date())],
                })(
                  <RangePicker
                    allowClear={false}
                    onCalendarChange={this.onCalendarChange}
                    disabledDate={this.disabledDate}
                    disabled={searching}
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
                    onChange={e => this.changeCondition({ name: e.target.value })}
                    placeholder={formatMessage({ id: 'search.input.name.upload' })}
                  />
                )}
              </FormItem>
            </Col>
            <Col xs={24} sm={16} md={8} lg={8}>
              <FormItem>
                <Button type="primary" htmlType="submit">
                  {formatMessage({ id: 'search' })}
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
    return <Card>{this.renderForm()}</Card>;
  }
}

const FormPersonSearch = Form.create()(PersonSearch);
export default connect(({ search }) => ({
  search,
}))(FormPersonSearch);
