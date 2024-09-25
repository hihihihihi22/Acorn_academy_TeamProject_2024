package com.fitconnect.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fitconnect.auth.PrincipalDetails;
import com.fitconnect.dto.ChatRoomDto;
import com.fitconnect.dto.MemberDto;
import com.fitconnect.dto.UserDto;
import com.fitconnect.repository.UserDao;
import com.fitconnect.service.MemberService;
import com.fitconnect.service.MessageService;

import org.springframework.web.bind.annotation.RequestParam;


@RestController
public class MemberController {
	
	@Autowired private UserDao userDao;

	@Autowired private MemberService service;
	
	@Autowired private MessageService MsgService;

	//회원의 정보를 추가하는 API 
	@PostMapping ("/member")
	public MemberDto memberSignUp(@RequestBody MemberDto dto) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        if(userDao.getData(userName).getId() != dto.getMember_num()) {
        	return null;
        }
		return service.addMember(dto);
	}
	
	//회원의 정보를 삭제하는 API
	@DeleteMapping("/member")
	public Map<String, Object> memberDelete(){
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        
        //채팅방 삭제
      	UserDto userDto = ((PrincipalDetails)authentication.getPrincipal()).getDto();
      	ChatRoomDto chatDto= MsgService.getChatRoom(userDto.getId());
      	String topic = chatDto.getTopic();
      	MsgService.deleteChat(topic);
        
      	//트레이너 정보 삭제
		service.deleteMember(userName);
		
		Map<String, Object> map=new HashMap<>();
		map.put("isSuccess", true);
		return map;
	}
	
	@GetMapping("/member")
	public MemberDto getMember() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
		return service.selectOne(userName);
	}
		
	//회원의 정보를 수정(업데이트) 하는 API
	@PatchMapping("/member/update/info")
	public void memberUpdateInfo(@RequestBody MemberDto dto) {
		service.updateMemberInfo(dto);
	}
	
	@PatchMapping("/member/update/plan")
	public void memberUpdatePlan(@RequestBody MemberDto dto) {
		service.updateMemberPlan(dto);
	}

	@PatchMapping("/member/update/trainer")
	public void memberUpdateTrainer(@RequestBody MemberDto dto) {
		//채팅방 생성
		ChatRoomDto chatDto = new ChatRoomDto();
		chatDto.setMember_num(dto.getMember_num());
		chatDto.setTrainer_num(dto.getTrainer_num());
		MsgService.insertChat(chatDto);
		
		service.updateMemberTrainer(dto);
	}

	@GetMapping("/member/list")
	public List<MemberDto> getMemberList(){
		return service.selectList();
	}
}