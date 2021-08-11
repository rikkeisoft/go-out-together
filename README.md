## Preview
  Việc hôm nay ăn gì, uống gì, đi đâu là một câu trả lời khó còn hơn cả thi đại học. Một người đã khó quyết định, khi có nhiều người còn khó quyết định gấp mấy lần. Chính vì thế, ứng dụng Cùng Đi Chơi sinh ra để giải quyết được nhu cầu đi đâu, ăn gì một cách dễ dàng bằng cách bình chọn.
 # Cách sử dụng app 
  - Người dùng sẽ truy cập vào app(sử dụng tài khoản đăng nhập là account google ) sau đó nhập địa điểm hiện tại, mở một group mới để bắt đầu session.
  - Khi session bắt đầu, người dùng sẽ hiện ra 1 form để nhập tiêu đề, nội dung, và list địa điểm chọn lựa (chọn từ popup bản đồ với autocomplete).
  - Sau khi nhập xong và submit, hệ thống sẽ sinh ra một đường dẫn để người dùng chia sẻ với những người bạn của mình.
  - Với những người truy cập vào đường dẫn ở trên: 1 popup sẽ hiện ra để người dùng nhập tên, địa điểm hiện tại.
  - Sau khi nhập tên, người dùng đó sẽ nhìn thấy được nội dung của session bao gồm: tiêu đề, nội dung, những ai đã tham gia session, danh sách lựa chọn cùng số lượng và những người vote. Người dùng có thể thêm vào một lựa chọn khác.
  - Sau khi tất cả kết thúc phần vote của mình hoặc người mở session click vào nút kết thúc, địa điểm được nhiều người chọn nhất sẽ hiện ra và thông báo kết quả địa điểm được vote nhiều nhất  
## Deploy your own
   https://go-out-together.vercel.app
## Công nghệ 
  - Next.js 
  - TailwindCSS v2.
  - React-query 
  - Mapbox 
  - Socket.io
## How to use
npx create-next-app --example with-tailwindcss with-tailwindcss-app
# or
yarn create next-app --example with-tailwindcss with-tailwindcss-app

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).
