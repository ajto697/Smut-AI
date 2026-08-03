import { Campus, ServiceProcedure } from './types';

export const PORTAL_DATA = {
  school: "Trợ Lý Học Tập & Cổng Thông Tin Sinh Viên Số",
  campuses: [
    {
      id: "cs1",
      name: "Cơ sở 1",
      address: "123 Nguyễn Trãi, TP.HCM",
      maps: "https://www.google.com/maps/dir/?api=1&destination=10.773,106.698",
      buildings: [
        {
          name: "Nhà A1",
          floors: [
            {
              level: "Tầng 1",
              rooms: [{ number: "102", func: "Phòng Công tác Sinh viên" }]
            },
            {
              level: "Tầng 2",
              rooms: [{ number: "205", func: "Phòng Đào tạo" }]
            }
          ]
        },
        {
          name: "Nhà B",
          floors: [
            {
              level: "Tầng 3",
              rooms: [{ number: "305", func: "Phòng Tài chính" }]
            }
          ]
        }
      ]
    },
    {
      id: "cs2",
      name: "Cơ sở 2",
      address: "456 Nguyễn Văn Linh, TP.HCM",
      maps: "https://www.google.com/maps/dir/?api=1&destination=10.729,106.719",
      buildings: [
        {
          name: "Nhà D",
          floors: [
            {
              level: "Tầng 4",
              rooms: [{ number: "401", func: "Phòng Đào tạo (cơ sở 2)" }]
            }
          ]
        }
      ]
    }
  ] as Campus[],
  services: [
    { procedure: "bảo lưu / tạm ngừng học", dept: "Phòng Đào tạo", room: "205", building: "Nhà A1", campus: "Cơ sở 1", staff: "thầy Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@university.edu.vn" },
    { procedure: "bảng điểm / kết quả học tập / điểm số", dept: "Phòng Đào tạo", room: "205", building: "Nhà A1", campus: "Cơ sở 1", staff: "cô Trần Thị B", phone: "0909876543", email: "tranthib@university.edu.vn" },
    { procedure: "thẻ sinh viên / xác nhận sinh viên / học lại / cải thiện điểm", dept: "Phòng Công tác Sinh viên", room: "102", building: "Nhà A1", campus: "Cơ sở 1", staff: "thầy Lê Văn C", phone: "0911222333", email: "levanc@university.edu.vn" },
    { procedure: "tài chính / học phí", dept: "Phòng Tài chính", room: "305", building: "Nhà B", campus: "Cơ sở 1", staff: "(liên hệ trực tiếp)", phone: "", email: "taichinh@university.edu.vn" }
  ] as ServiceProcedure[],
  gpaHistory: [
    { semester: "HK1 23-24", gpa: 3.2 },
    { semester: "HK2 23-24", gpa: 3.1 },
    { semester: "HK1 24-25", gpa: 3.4 },
    { semester: "HK2 24-25", gpa: 3.5 },
    { semester: "HK1 25-26", gpa: 3.45 }
  ]
};

// Export alias for backward compatibility
export const SMUT_DATA = PORTAL_DATA;

export const SYSTEM_PROMPT = `Bạn là Trợ lý Cú Học Tập (Scholar Owl AI), chatbot thông minh hỗ trợ sinh viên. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 120 từ), chính xác.
DỮ LIỆU: ${JSON.stringify(PORTAL_DATA)}
QUY TẮC:
1. Thủ tục: nêu phòng, tòa nhà, cơ sở, người phụ trách, SĐT, email.
2. Địa điểm phòng: nêu số phòng, tầng, tòa, cơ sở.
3. Chỉ đường cơ sở: nêu địa chỉ + thêm tag [MAP:cs1] hoặc [MAP:cs2] ở cuối.
4. Thủ tục có địa điểm: thêm tag [MAP:cs1] cuối câu.
5. Không bịa thông tin ngoài dữ liệu. Nếu không biết → hotline: 028-1234-5678.`;

