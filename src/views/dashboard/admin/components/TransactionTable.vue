<template>
  <el-table :data="orderList" style="width: 100%;padding-top: 15px;">
    <el-table-column label="订单编号" min-width="200">
      <template slot-scope="scope">{{ scope.row.orderNo | orderNoFilter }}</template>
    </el-table-column>
    <el-table-column label="用户名" width="195" align="center">
      <template slot-scope="scope">{{ scope.row.nickname }}</template>
    </el-table-column>
    <el-table-column label="金额" width="195" align="center">
      <template slot-scope="scope">¥{{ scope.row.totalFee }}</template>
    </el-table-column>
    <el-table-column label="状态" width="100" align="center">
      <template slot-scope="scope">
        <el-tag :type="scope.row.status | statusFilter">{{scope.row.status === 1 ? '已支付' : '未支付'}}</el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import fetchList from "@/api/transaction";

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "danger",
      };
      return statusMap[status];
    },
    orderNoFilter(str) {
      return str.substring(0, 30);
    },
  },
  data() {
    return {
      orderList: [],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      fetchList.fetchList().then((response) => {
        this.orderList = response.data.orderList;
        console.log("=====" + JSON.stringify(this.orderList));
      });
      // fetchList().then((response) => {
      //   this.list = response.data.data.orderList;
      //   console.log("=====" + list);
      // });
    },
  },
};
</script>
