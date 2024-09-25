package com.fitconnect.controller;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fitconnect.dto.ChatRoomDto;
import com.fitconnect.dto.UserDto;
import com.fitconnect.repository.UserDao;
import com.fitconnect.service.MessageService;
import com.fitconnect.util.JwtUtil;

@RestController
public class UserController {
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	// react js 를 테스트 하기 위한 코딩
	@Autowired
	private AuthenticationManager authManager;
	
	@Autowired 
	private MessageService MsgService;
	
	@Value("${file.location}")
	private String fileLocation;
	
	@GetMapping("/")
	public String home() {
		return "home";
	}
	
	@PostMapping("/auth")
	public String auth(@RequestBody UserDto dto ) throws Exception {
		try {
			//입력한 username 과 password 를 인증토큰 객체에 담아서 
			UsernamePasswordAuthenticationToken authToken=
					new UsernamePasswordAuthenticationToken(dto.getUserName(), dto.getPassword());	
			//인증 메니저 객체를 이용해서 인증을 진행한다 
			authManager.authenticate(authToken);
		}catch(Exception e) {
			//예외가 발생하면 인증실패(아이디 혹은 비밀번호 틀림 등등...)
			e.printStackTrace();
			throw new Exception("아이디 혹은 비밀번호가 틀려요!");
		}
		//예외가 발생하지 않고 여기까지 실행 된다면 인증을 통과 한 것이다. 토큰을 발급해서 응답한다.
		String userName = dto.getUserName();
		int id = userDao.getData(userName).getId();
		String token=jwtUtil.generateToken(userName, id);
		return "Bearer+"+token;
	}
	
	@PostMapping("/user")
	public Map<String, Object> signup(@RequestBody UserDto dto) {
		String rawPassword = dto.getPassword();
		String encPassword = passwordEncoder.encode(rawPassword);
		dto.setPassword(encPassword);
		Map<String, Object> map=new HashMap<>();
		if(userDao.getData(dto.getUserName()) != null) {
			map.put("isSuccess", false);
		}
		else {
			map.put("isSuccess", true);
			userDao.insert(dto);
		}
		
		return map;
	}

	@DeleteMapping("/user")
	public Map<String, Object> delete() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
		Map<String, Object> map=new HashMap<>();
		if(userDao.getData(userName) == null) {
			map.put("isSuccess", false);
		}
		else {
			map.put("isSuccess", true);
			userDao.delete(userName);
		}
		//채팅방 삭제
		ChatRoomDto chatDto= MsgService.getChatRoom();
		String topic = chatDto.getTopic();
		MsgService.deleteChat(topic);
		
		return map;
	}

	@GetMapping("/user")
	public UserDto getUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        return userDao.getData(userName);
	}

	@PatchMapping(value="/user/update/info", consumes = {MediaType. APPLICATION_JSON_VALUE, MediaType. MULTIPART_FORM_DATA_VALUE})
	public UserDto updateInfo(@ModelAttribute UserDto dto) {

		System.out.println(fileLocation);
		if(dto.getImage() != null) {
			MultipartFile image = dto.getImage();
		
			String profile=UUID.randomUUID().toString();
			//저장할 파일의 전체 경로 구성하기 
			String filePath=fileLocation+File.separator+profile;
			System.out.println(filePath);
			try {
				//업로드된 파일을 이동시킬 목적지 File 객체
				File f=new File(filePath);
				image.transferTo(f);
				
			}catch(Exception e) {
				e.printStackTrace();
			}
			dto.setProfile(profile);
		}
		
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        dto.setUserName(userName);
		
		userDao.updateInfo(dto);
		UserDto userDto = userDao.getData(userName);
		
		return userDto;
	}
	
	@PatchMapping("/user/update/password")
	public UserDto updatePassword(@RequestBody UserDto dto) {
		String rawPassword = dto.getNewPassword();
		String encPassword = passwordEncoder.encode(rawPassword);
		dto.setPassword(encPassword);
		userDao.updatePwd(dto);
		dto.setNewPassword(null);
		return dto;
	}
	
	@PatchMapping("/user/update/role")
	public UserDto updateRoleAdmin(@RequestBody UserDto dto) {
		String role = dto.getRole();
		if(role.equals("ADMIN") || role.equals("MEMBER") || role.equals("TRAINER")) {
			userDao.updateRole(dto);
		}
		else {
			dto.setRole("FALSE");
		}
		return dto;
	}

	
}