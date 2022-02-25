<template>
  <div class="container">
    <!-- 商品列表 -->
    <div class="mt-4">
      <Product
        :id="productId"
        @add-to-cart="addToCart"
        ref="orderProductModal"
      ></Product>
      <table class="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td style="width: 200px">
              <div
                style="
                  height: 100px;
                  background-size: cover;
                  background-position: center;
                "
                :style="{ backgroundImage: `url(${item.imageUrl})` }"
              ></div>
            </td>
            <td>
              {{ item.title }}
            </td>
            <td>
              <div class="h5" v-if="!item.price">
                {{ item.origin_price }} 元
              </div>
              <del class="h6" v-if="item.price"
                >原價 {{ item.origin_price }} 元</del
              >
              <div class="h5" v-if="item.price">
                現在只要 {{ item.price }} 元
              </div>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="getProduct(item.id)"
                  :disabled="isLoading === item.id"
                >
                  <i class="fas fa-spinner fa-pulse"></i>
                  查看更多
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  @click="addToCart(item.id)"
                  :disabled="isLoading === item.id"
                >
                  <i class="fas fa-spinner fa-pulse"></i>
                  <span
                    class="spinner-grow spinner-grow-sm"
                    v-show="isLoading === item.id"
                  ></span>
                  加到購物車
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 購物車 -->
    <div class="text-end">
      <button
        class="btn btn-outline-danger"
        type="button"
        @click="removeCartAll"
        :disabled="!cartData.carts || cartData.carts.length === 0"
      >
        清空購物車
      </button>
    </div>
    <table class="table align-middle">
      <thead>
        <tr>
          <th></th>
          <th>品名</th>
          <th style="width: 150px">數量/單位</th>
          <th>單價</th>
          <th>單筆總價</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="cartData.carts">
          <tr v-for="item in cartData.carts" :key="item.id">
            <td>
              <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                @click="removeCart(item.id)"
              >
                <i class="fas fa-spinner fa-pulse"></i>
                x
              </button>
            </td>
            <td>
              {{ item.product.title }}
              <!-- <div class="text-success">已套用優惠券</div> -->
            </td>
            <td>
              <div class="input-group input-group-sm">
                <div class="input-group mb-3">
                  <!-- <input
                    min="1"
                    type="number"
                    class="form-control"
                    v-model.number="item.qty"
                  /> -->
                  <select
                    class="form-select"
                    v-model="item.qty"
                    @change="updateCart(item)"
                    :disabled="isLoading === item.id"
                  >
                    <option
                      :value="num"
                      v-for="num in 20"
                      :key="num + 'item.id'"
                    >
                      {{ num }}
                    </option>
                  </select>
                  <span class="input-group-text" id="basic-addon2">{{
                    item.product.unit
                  }}</span>
                </div>
              </div>
            </td>
            <td class="text-end">
              {{ item.product.price }}
            </td>
            <td class="text-end">
              {{ item.total }}
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" class="text-end">總計</td>
          <td class="text-end">{{ cartData.final_total }}</td>
        </tr>
        <!-- <tr>
          <td colspan="4" class="text-end text-success">折扣價</td>
          <td class="text-end text-success">{{}}</td>
        </tr> -->
      </tfoot>
    </table>
    <!-- 會員資料表單驗證 -->
    <div class="my-5 row justify-content-center">
      <form ref="form" class="col-md-6" @submit.prevent="createOrder">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            class="form-control"
            placeholder="請輸入Email"
            v-validate="'required|email'"
            :class="{ 'is-invalid': errors.first('email') }"
            v-model="form.user.email"
          />
          <span v-if="errors.first('email')" class="invalid-feedback"
            >emil格式錯誤</span
          >
        </div>

        <div class="mb-3">
          <label for="name" class="form-label">收件人姓名</label>
          <input
            id="name"
            name="name"
            type="name"
            class="form-control"
            placeholder="請輸入姓名"
            v-validate="`required`"
            :class="{ 'is-invalid': errors.has('name') }"
            v-model="form.user.name"
          />
          <span v-if="errors.has('name')" class="invalid-feedback"
            >請輸入姓名</span
          >
        </div>

        <div class="mb-3">
          <label for="tel" class="form-label">收件人電話</label>
          <input
            id="tel"
            name="電話"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.has('電話') }"
            placeholder="請輸入電話"
            v-validate="`required|min:8|max:10`"
            v-model="form.user.tel"
          />
          <span v-if="errors.has('電話')" class="invalid-feedback"
            >請輸入電話 不可超過十位數</span
          >
        </div>

        <div class="mb-3">
          <label for="address" class="form-label">收件人地址</label>
          <input
            id="address"
            name="地址"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.has('地址') }"
            placeholder="請輸入地址"
            v-validate="`required`"
            v-model="form.user.address"
          />
          <span v-if="errors.has('地址')" class="invalid-feedback"
            >請輸入地址</span
          >
        </div>

        <div class="mb-3">
          <label for="message" class="form-label">留言</label>
          <textarea
            name=""
            id="message"
            class="form-control"
            cols="30"
            rows="10"
            v-model="form.message"
          ></textarea>
        </div>
        <div class="text-end">
          <button
            type="submit"
            class="btn btn-danger"
            :disabled="!cartData.carts || cartData.carts.length === 0"
          >
            送出訂單
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Product from "@/components/Product.vue";
export default {
  data() {
    return {
      url: "https://vue3-course-api.hexschool.io/v2", // 請加入站點
      path: "hexschooljerry", // 請加入個人 API Path};
      cartData: {
        carts: [],
      },
      products: [],
      product: {},
      isLoading: "",
      productId: "",
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  components: {
    Product,
  },
  methods: {
    checkLogin() {
      // #3 取得 Token（Token 僅需要設定一次）
      /* eslint-disable */
      const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      );
      this.axios.defaults.headers.common["Authorization"] = token;
      // #4  確認是否登入
      this.axios
        .post(`${this.url}/api/user/check`)
        .then((res) => {
          if (!res.data.success) {
            this.$router.push("/");
          }
          this.getProducts();
        })
        .catch((error) => {
          alert(error.response.data.message);
          this.$router.push("/");
        });
    },
    getProducts() {
      this.axios
        .get(`${this.url}/api/${this.path}/products/all`)
        .then((res) => {
          this.products = Object.values(res.data.products).map((item) => item);
        })
        .catch((error) => {
          alert(error.response.data.message);
        });
    },
    getProduct(id) {
      this.isLoading = id;
      this.productId = id;
      this.$refs.orderProductModal.openModal();
      this.isLoading = "";
    },
    addToCart(id, qty = 1) {
      this.isLoading = id;
      const url = `${this.url}/api/${this.path}/cart`;
      const cart = {
        product_id: id,
        qty,
      };
      this.$refs.orderProductModal.hideModal();
      this.axios
        .post(url, { data: cart })
        .then((response) => {
          alert(response.data.message);
          this.getCarts();
          this.isLoading = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    getCarts() {
      this.axios
        .get(`${this.url}/api/${this.path}/cart`)
        .then((res) => {
          this.cartData = res.data.data;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    removeCart(id) {
      this.axios
        .delete(`${this.url}/api/${this.path}/cart/${id}`)
        .then((res) => {
          alert(res.data.message);
          this.getCarts();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    removeCartAll() {
      this.axios
        .delete(`${this.url}/api/${this.path}/carts`)
        .then((res) => {
          alert(res.data.message);
          this.getCarts();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    updateCart(item) {
      this.isLoading = item.id;
      const url = `${this.url}/api/${this.path}/cart/${item.id}`;
      const cart = {
        product_id: item.id,
        qty: item.qty,
      };
      this.$refs.orderProductModal.hideModal();
      this.axios
        .put(url, { data: cart })
        .then((response) => {
          alert(response.data.message);
          this.getCarts();
          this.isLoading = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    createOrder() {
      this.$validator.validate().then((result) => {
        if (result) {
          const url = `${this.url}/api/${this.path}/order`;
          const order = this.form;
          this.axios
            .post(url, { data: order })
            .then((response) => {
              alert(response.data.message);
              this.emptyForm();
              this.getCarts();
            })
            .catch((err) => {
              console.log(err);
              alert(err.data);
            });
        } else {
          // 驗證失敗產生的行為
          console.log("客戶戶資料填寫不完整");
        }
      });
    },
    emptyForm() {
      this.form.message = null;
      this.form.user.name = null;
      this.form.user.email = null;
      this.form.user.tel = null;
      this.form.user.address = null;
    },
  },
  mounted() {
    this.checkLogin();
    this.getProducts();
    this.getCarts();
  },
};
</script>
